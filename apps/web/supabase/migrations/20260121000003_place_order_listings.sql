-- Updated place_order function to work with listings table
-- This replaces the previous version that used products table

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
    listing_record RECORD;
    generated_order_number TEXT;
BEGIN
    -- Generate unique order number
    generated_order_number := 'BTK-' || upper(substring(md5(random()::text) from 1 for 5)) || '-' || substring(extract(epoch from now())::text from 7 for 4);

    -- Loop through items to check and deduct stock from LISTINGS table
    FOR item IN SELECT * FROM jsonb_to_recordset(items_json) AS x(id UUID, quantity INT)
    LOOP
        -- Lock listing row for update
        SELECT * INTO listing_record FROM listings WHERE id = item.id FOR UPDATE;
        
        IF NOT FOUND THEN
             RETURN jsonb_build_object('success', false, 'message', 'Product not found: ' || item.id);
        END IF;

        -- Check stock (stock_quantity column in listings)
        IF listing_record.stock_quantity IS NOT NULL AND listing_record.stock_quantity < item.quantity THEN
             RETURN jsonb_build_object('success', false, 'message', 'Insufficient stock for: ' || listing_record.name);
        END IF;

        -- Deduct stock (only if stock tracking is enabled)
        IF listing_record.stock_quantity IS NOT NULL THEN
            UPDATE listings 
            SET stock_quantity = stock_quantity - item.quantity 
            WHERE id = item.id;
        END IF;
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

    -- Notify merchant via Supabase Realtime (the orders insert will trigger this automatically)
    
    RETURN jsonb_build_object('success', true, 'order_id', new_order_id, 'order_number', generated_order_number);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated and anon users (for public checkout)
GRANT EXECUTE ON FUNCTION place_order TO authenticated;
GRANT EXECUTE ON FUNCTION place_order TO anon;
