-- Function to handle atomic subscription purchase
CREATE OR REPLACE FUNCTION purchase_subscription(
    merchant_id_input UUID,
    plan_slug_input TEXT,
    duration_months INT,
    total_cost DECIMAL
) RETURNS JSONB AS $$
DECLARE
    current_balance DECIMAL;
    merchant_record RECORD;
    new_expiry TIMESTAMPTZ;
BEGIN
    -- Get merchant record with lock
    SELECT * INTO merchant_record FROM merchants WHERE id = merchant_id_input FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Merchant not found');
    END IF;

    current_balance := merchant_record.bouteek_cash_balance;

    -- Check balance
    IF current_balance < total_cost THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    -- Calculate new expiry
    -- If current expiry is in future, add to it? Or just reset? 
    -- Logic: If subscription_tier matches and is active, extend. Else reset from now.
    IF merchant_record.subscription_tier = plan_slug_input AND merchant_record.subscription_end > NOW() THEN
        new_expiry := merchant_record.subscription_end + (duration_months || ' months')::INTERVAL;
    ELSE
        new_expiry := NOW() + (duration_months || ' months')::INTERVAL;
    END IF;

    -- Update Merchant
    UPDATE merchants 
    SET 
        bouteek_cash_balance = bouteek_cash_balance - total_cost,
        subscription_tier = plan_slug_input,
        subscription_start = NOW(),
        subscription_end = new_expiry,
        subscription_status = 'active'
    WHERE id = merchant_id_input;

    -- Log Transaction
    INSERT INTO wallet_transactions (
        merchant_id,
        amount,
        transaction_type,
        description,
        status,
        created_at
    ) VALUES (
        merchant_id_input,
        -total_cost, -- Negative for deduction
        'subscription_payment',
        'Subscription: ' || plan_slug_input || ' (' || duration_months || ' months)',
        'completed',
        NOW()
    );

    RETURN jsonb_build_object('success', true, 'new_balance', current_balance - total_cost, 'expiry', new_expiry);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
