-- Add commission_rate to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0; -- e.g. 5.00 for 5%

-- Add subscription lifecycle fields to merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'; -- active, past_due, maintenance
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- Function to handle order confirmation and commission deduction
CREATE OR REPLACE FUNCTION confirm_order(p_order_id UUID, p_merchant_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_total DECIMAL;
    v_commission_rate DECIMAL;
    v_commission_amount DECIMAL;
    v_current_balance DECIMAL;
BEGIN
    -- Get order total
    SELECT total_amount INTO v_order_total FROM orders WHERE id = p_order_id;
    
    -- Get commission rate from merchant's plan
    SELECT p.commission_rate INTO v_commission_rate
    FROM merchants m
    JOIN plans p ON m.subscription_tier = p.slug -- Assuming subscription_tier stores slug, ideally should be ID link but kept as text for now
    WHERE m.id = p_merchant_id;

    -- Default to 0 if no plan found (shouldn't happen)
    IF v_commission_rate IS NULL THEN
        v_commission_rate := 0;
    END IF;

    v_commission_amount := v_order_total * (v_commission_rate / 100);

    -- Deduct from balance
    UPDATE merchants 
    SET bouteek_cash_balance = bouteek_cash_balance - v_commission_amount 
    WHERE id = p_merchant_id;

    -- Record transaction
    INSERT INTO wallet_transactions (merchant_id, amount, type, description, status)
    VALUES (p_merchant_id, -v_commission_amount, 'commission', 'Commission for Order #' || p_order_id, 'completed');

    -- Update order status
    UPDATE orders SET status_id = (SELECT id FROM order_statuses WHERE code = 'paid') WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
