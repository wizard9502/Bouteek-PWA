-- Optimistic Top-Up & Reversal Logic (v2: With Subscription Revocation)

-- 1. Optimistic Top-Up: Credits balance IMMEDIATELY upon user submission
CREATE OR REPLACE FUNCTION public.topup_with_wave(p_merchant_id uuid, p_amount numeric, p_wave_tx_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance numeric;
BEGIN
    -- Check if TX ID already exists
    IF EXISTS (SELECT 1 FROM public.wallet_transactions WHERE reference_id = p_wave_tx_id) THEN
        RETURN json_build_object('success', false, 'message', 'Transaction ID already used');
    END IF;

    -- 1. Insert Transaction (Status: Pending Verification)
    INSERT INTO public.wallet_transactions (
        merchant_id, 
        amount, 
        type, 
        description, 
        reference_id, 
        verification_status
    ) VALUES (
        p_merchant_id,
        p_amount,
        'deposit',
        'Wave Top-up (Optimistic Credit)',
        p_wave_tx_id,
        'pending'
    );

    -- 2. INSTANTLY Credit Merchant Balance
    UPDATE public.merchants
    SET bouteek_cash_balance = COALESCE(bouteek_cash_balance, 0) + p_amount
    WHERE id = p_merchant_id
    RETURNING bouteek_cash_balance INTO v_new_balance;

    RETURN json_build_object('success', true, 'message', 'Top-up credited! Verification pending.', 'new_balance', v_new_balance);
END;
$$;

-- 2. Reverse Top-Up: Clawback for Denied Transactions + Subscription Revocation
CREATE OR REPLACE FUNCTION public.reverse_topup(p_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_merchant_id uuid;
    v_amount numeric;
    v_current_tier text;
    v_plan_price numeric;
    v_new_balance numeric;
BEGIN
    -- Get Transaction Details
    SELECT merchant_id, amount 
    INTO v_merchant_id, v_amount
    FROM public.wallet_transactions
    WHERE id = p_transaction_id AND (verification_status = 'pending' OR verification_status = 'completed');
    
    -- Proceed even if completed if we need to force reversal, but primarily for pending. 
    -- User logic says verify later, so Admin might be acting on a 'pending' one.

    IF v_merchant_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Transaction not found or invalid status');
    END IF;

    -- 1. Update Status to Failed
    UPDATE public.wallet_transactions
    SET verification_status = 'failed',
        updated_at = now()
    WHERE id = p_transaction_id;

    -- 2. DEDUCT Balance (Clawback)
    UPDATE public.merchants
    SET bouteek_cash_balance = bouteek_cash_balance - v_amount
    WHERE id = v_merchant_id
    RETURNING bouteek_cash_balance, subscription_tier INTO v_new_balance, v_current_tier;

    -- 3. Check for Negative Balance & Subscription
    -- If balance is negative AND user is on a paid plan, assume they used the fake money for the plan.
    IF v_new_balance < 0 AND v_current_tier IS NOT NULL AND v_current_tier != 'starter' THEN
        
        -- Get Plan Price to see if refunding it fixes the debt (or at least logic demands it)
        -- Assuming 'plans' table exists with 'slug' and 'price'
        SELECT price INTO v_plan_price FROM public.plans WHERE slug = v_current_tier;

        IF v_plan_price IS NOT NULL AND v_plan_price > 0 THEN
             -- Downgrade to Starter
            UPDATE public.merchants
            SET subscription_tier = 'starter',
                -- "Refund" the plan price to cancel the debt caused by the clawback regarding the plan
                bouteek_cash_balance = bouteek_cash_balance + v_plan_price
            WHERE id = v_merchant_id
            RETURNING bouteek_cash_balance INTO v_new_balance;

            -- Log the revocation
            INSERT INTO public.wallet_transactions (
                merchant_id, amount, type, description, verification_status
            ) VALUES (
                v_merchant_id, 
                v_plan_price, 
                'refund', 
                'Subscription Revoked due to Failed Top-up', 
                'completed'
            );
        END IF;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Top-up reversed. Subscription revoked if necessary.', 'new_balance', v_new_balance);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.topup_with_wave TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_topup TO authenticated; 
