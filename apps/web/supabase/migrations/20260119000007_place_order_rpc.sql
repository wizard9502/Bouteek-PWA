-- Function to place an order atomically with inventory check/decrement
CREATE OR REPLACE FUNCTION place_order(
    merchant_id_input UUID,
    customer_name_input TEXT,
    customer_phone_input TEXT,
    delivery_address_input TEXT,
    items_json JSONB, -- Array of objects: { id, name, price, quantity }
    subtotal_input DECIMAL,
    total_input DECIMAL,
    payment_method_input TEXT,
    notes_input TEXT
) RETURNS JSONB AS $$
DECLARE
    new_order_id UUID;
    item RECORD;
    product_record RECORD;
    generated_order_number TEXT;
BEGIN
    -- unique order number
    generated_order_number := 'BTK-' || upper(substring(md5(random()::text) from 1 for 5)) || '-' || substring(extract(epoch from now())::text from 7 for 4);

    -- Loop through items to check and deduct stock
    FOR item IN SELECT * FROM jsonb_to_recordset(items_json) AS x(id UUID, quantity INT)
    LOOP
        -- Lock product row for update
        SELECT * INTO product_record FROM products WHERE id = item.id FOR UPDATE;
        
        IF NOT FOUND THEN
             RETURN jsonb_build_object('success', false, 'message', 'Product not found: ' || item.id);
        END IF;

        IF product_record.stock < item.quantity THEN
             RETURN jsonb_build_object('success', false, 'message', 'Insufficient stock for product: ' || product_record.name);
        END IF;

        -- update stock
        UPDATE products 
        SET stock = stock - item.quantity 
        WHERE id = item.id;
    END LOOP;

    -- Insert Order
    INSERT INTO orders (
        merchant_id,
        order_number,
        customer_name,
        customer_phone,
        delivery_address,
        items,
        subtotal,
        total,
        status,
        payment_method,
        notes,
        created_at
    ) VALUES (
        merchant_id_input,
        generated_order_number,
        customer_name_input,
        customer_phone_input,
        delivery_address_input,
        items_json,
        subtotal_input,
        total_input,
        'pending',
        payment_method_input,
        notes_input,
        NOW()
    ) RETURNING id INTO new_order_id;

    RETURN jsonb_build_object('success', true, 'order_id', new_order_id, 'order_number', generated_order_number);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
