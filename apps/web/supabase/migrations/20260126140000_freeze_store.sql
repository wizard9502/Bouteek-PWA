-- Store Freezing Logic

-- 1. Add is_frozen to merchants
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false;

-- 2. Update Optimistic Top-Up (Auto-Unfreeze)
CREATE OR REPLACE FUNCTION public.topup_with_wave(p_merchant_id uuid, p_amount numeric, p_wave_tx_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance numeric;
    v_is_frozen boolean;
BEGIN
    -- Check if TX ID already exists
    IF EXISTS (SELECT 1 FROM public.wallet_transactions WHERE reference_id = p_wave_tx_id) THEN
        RETURN json_build_object('success', false, 'message', 'Transaction ID already used');
    END IF;

    -- 1. Insert Transaction
    INSERT INTO public.wallet_transactions (
        merchant_id, amount, type, description, reference_id, verification_status
    ) VALUES (
        p_merchant_id, p_amount, 'deposit', 'Wave Top-up (Optimistic Credit)', p_wave_tx_id, 'pending'
    );

    -- 2. Credit Balance & Auto-Unfreeze
    UPDATE public.merchants
    SET bouteek_cash_balance = COALESCE(bouteek_cash_balance, 0) + p_amount
    WHERE id = p_merchant_id
    RETURNING bouteek_cash_balance, is_frozen INTO v_new_balance, v_is_frozen;

    -- 3. Check Unfreeze Condition
    IF v_is_frozen AND v_new_balance >= 0 THEN
        UPDATE public.merchants SET is_frozen = false WHERE id = p_merchant_id;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Top-up credited! Store active.', 'new_balance', v_new_balance);
END;
$$;

-- 3. Update Reverse Top-Up (Auto-Freeze)
CREATE OR REPLACE FUNCTION public.reverse_topup(p_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_merchant_id uuid;
    v_amount numeric;
    v_new_balance numeric;
    v_user_id uuid;
BEGIN
    SELECT merchant_id, amount INTO v_merchant_id, v_amount
    FROM public.wallet_transactions
    WHERE id = p_transaction_id;

    IF v_merchant_id IS NULL THEN
         RETURN json_build_object('success', false, 'message', 'Transaction not found');
    END IF;

    -- 1. Failed Status
    UPDATE public.wallet_transactions
    SET verification_status = 'failed', updated_at = now()
    WHERE id = p_transaction_id;

    -- 2. Deduct Balance
    UPDATE public.merchants
    SET bouteek_cash_balance = bouteek_cash_balance - v_amount
    WHERE id = v_merchant_id
    RETURNING bouteek_cash_balance, user_id INTO v_new_balance, v_user_id;

    -- 3. Freeze if Negative
    IF v_new_balance < 0 THEN
        UPDATE public.merchants SET is_frozen = true WHERE id = v_merchant_id;
    END IF;

    RETURN json_build_object('success', true, 'message', 'Reversed. Store frozen if balance negative.', 'new_balance', v_new_balance);
END;
$$;
