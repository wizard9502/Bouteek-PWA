-- Trust-Flow Payment System: Immediate Credit & Deferred Sanction
-- This migration adds the database structures for the "Credit First, Verify Later" model

-- 1. Create enums for account status and verification status
DO $$ BEGIN
    CREATE TYPE public.account_status_enum AS ENUM ('active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_status_enum AS ENUM ('AUTO_CREDITED', 'PENDING_VERIFICATION', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Trust-Flow columns to merchants table
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS account_status public.account_status_enum DEFAULT 'active' NOT NULL;

ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS last_successful_topup_at TIMESTAMPTZ;

ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS debt_amount INTEGER DEFAULT 0;

-- 3. Add Wave transaction tracking to wallet_transactions
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS wave_transaction_id TEXT UNIQUE;

ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS verification_status public.verification_status_enum DEFAULT 'AUTO_CREDITED';

-- Create index for faster Wave transaction ID lookups
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wave_tx_id 
ON public.wallet_transactions(wave_transaction_id) 
WHERE wave_transaction_id IS NOT NULL;

-- 4. RPC: Atomic Top-up with Wave Transaction ID
CREATE OR REPLACE FUNCTION public.topup_with_wave(
    p_merchant_id UUID,
    p_amount INTEGER,
    p_wave_tx_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_restricted BOOLEAN;
    v_new_balance INTEGER;
    v_status public.verification_status_enum;
BEGIN
    -- Validate Wave Transaction ID format (17 characters)
    IF length(p_wave_tx_id) != 17 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid Wave Transaction ID format. Must be 17 characters.');
    END IF;

    -- Check if Transaction ID already used
    IF EXISTS (SELECT 1 FROM public.wallet_transactions WHERE wave_transaction_id = p_wave_tx_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'This Wave Transaction ID has already been used.');
    END IF;

    -- Get merchant's graylist status
    SELECT is_restricted INTO v_is_restricted
    FROM public.merchants
    WHERE id = p_merchant_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Merchant not found.');
    END IF;

    -- Determine verification status based on graylist
    IF v_is_restricted THEN
        v_status := 'PENDING_VERIFICATION';
    ELSE
        v_status := 'AUTO_CREDITED';
    END IF;

    -- Insert wallet transaction
    INSERT INTO public.wallet_transactions (
        merchant_id, 
        amount, 
        type, 
        description, 
        wave_transaction_id, 
        verification_status
    )
    VALUES (
        p_merchant_id, 
        p_amount, 
        'topup', 
        'Wave Top-up: ' || p_wave_tx_id, 
        p_wave_tx_id, 
        v_status
    );

    -- If not graylisted, credit immediately
    IF NOT v_is_restricted THEN
        UPDATE public.merchants
        SET 
            bouteek_cash_balance = bouteek_cash_balance + p_amount,
            last_successful_topup_at = NOW()
        WHERE id = p_merchant_id
        RETURNING bouteek_cash_balance INTO v_new_balance;

        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Balance credited immediately!',
            'new_balance', v_new_balance,
            'status', 'AUTO_CREDITED'
        );
    ELSE
        -- Graylisted: pending manual verification
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Your account is under review. Balance will be credited within 24h after manual verification.',
            'status', 'PENDING_VERIFICATION'
        );
    END IF;
END;
$$;

-- 5. RPC: Calculate Merchant Debt (commissions since last successful topup)
CREATE OR REPLACE FUNCTION public.calculate_merchant_debt(
    p_merchant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_topup TIMESTAMPTZ;
    v_total_commissions INTEGER;
    v_current_balance INTEGER;
    v_debt INTEGER;
BEGIN
    -- Get last successful topup timestamp and current balance
    SELECT last_successful_topup_at, bouteek_cash_balance 
    INTO v_last_topup, v_current_balance
    FROM public.merchants
    WHERE id = p_merchant_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Merchant not found.');
    END IF;

    -- Sum all commission deductions since last topup
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_total_commissions
    FROM public.wallet_transactions
    WHERE merchant_id = p_merchant_id
      AND type = 'commission'
      AND amount < 0
      AND (v_last_topup IS NULL OR created_at > v_last_topup);

    -- Debt = Commissions - Current Balance (minimum 0)
    v_debt := GREATEST(v_total_commissions - v_current_balance, 0);

    RETURN jsonb_build_object(
        'success', true,
        'total_commissions', v_total_commissions,
        'current_balance', v_current_balance,
        'debt_amount', v_debt,
        'last_topup', v_last_topup
    );
END;
$$;

-- 6. RPC: Suspend Merchant (Admin action on fraud detection)
CREATE OR REPLACE FUNCTION public.suspend_merchant(
    p_merchant_id UUID,
    p_fraudulent_tx_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_debt_result JSONB;
    v_debt_amount INTEGER;
BEGIN
    -- Calculate debt first
    v_debt_result := public.calculate_merchant_debt(p_merchant_id);
    v_debt_amount := (v_debt_result->>'debt_amount')::INTEGER;

    -- Mark the transaction as rejected if provided
    IF p_fraudulent_tx_id IS NOT NULL THEN
        UPDATE public.wallet_transactions
        SET verification_status = 'REJECTED'
        WHERE wave_transaction_id = p_fraudulent_tx_id;
    END IF;

    -- Suspend the merchant and set graylist flag
    UPDATE public.merchants
    SET 
        account_status = 'suspended',
        is_restricted = true,
        debt_amount = v_debt_amount,
        bouteek_cash_balance = 0 -- Zero out balance
    WHERE id = p_merchant_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Merchant suspended.',
        'debt_amount', v_debt_amount
    );
END;
$$;

-- 7. RPC: Reactivate Merchant (After debt payment)
CREATE OR REPLACE FUNCTION public.reactivate_merchant(
    p_merchant_id UUID,
    p_payment_wave_tx_id TEXT,
    p_payment_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_debt INTEGER;
BEGIN
    -- Get current debt
    SELECT debt_amount INTO v_current_debt
    FROM public.merchants
    WHERE id = p_merchant_id;

    IF v_current_debt IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Merchant not found.');
    END IF;

    -- Validate payment covers debt
    IF p_payment_amount < v_current_debt THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Payment amount insufficient. Debt is ' || v_current_debt || ' XOF.'
        );
    END IF;

    -- Check transaction ID uniqueness
    IF EXISTS (SELECT 1 FROM public.wallet_transactions WHERE wave_transaction_id = p_payment_wave_tx_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'This Wave Transaction ID has already been used.');
    END IF;

    -- Record the debt payment (this goes into PENDING since they're graylisted)
    INSERT INTO public.wallet_transactions (
        merchant_id, 
        amount, 
        type, 
        description, 
        wave_transaction_id, 
        verification_status
    )
    VALUES (
        p_merchant_id, 
        p_payment_amount, 
        'debt_payment', 
        'Debt clearance payment: ' || p_payment_wave_tx_id, 
        p_payment_wave_tx_id, 
        'PENDING_VERIFICATION'
    );

    -- Note: Actual reactivation happens after admin verifies the payment
    -- For now, just mark as pending reactivation
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment submitted. Your account will be reactivated within 24h after verification.',
        'status', 'PENDING_VERIFICATION'
    );
END;
$$;

-- 8. RPC: Admin verifies pending transaction and credits/reactivates
CREATE OR REPLACE FUNCTION public.admin_verify_transaction(
    p_transaction_id UUID,
    p_approved BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_new_balance INTEGER;
BEGIN
    -- Get transaction details
    SELECT * INTO v_tx
    FROM public.wallet_transactions
    WHERE id = p_transaction_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found.');
    END IF;

    IF v_tx.verification_status != 'PENDING_VERIFICATION' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction is not pending verification.');
    END IF;

    IF p_approved THEN
        -- Update transaction status
        UPDATE public.wallet_transactions
        SET verification_status = 'AUTO_CREDITED'
        WHERE id = p_transaction_id;

        -- Credit the merchant
        UPDATE public.merchants
        SET 
            bouteek_cash_balance = bouteek_cash_balance + v_tx.amount,
            last_successful_topup_at = NOW(),
            -- If this was a debt payment, clear the debt and reactivate
            account_status = CASE 
                WHEN v_tx.type = 'debt_payment' THEN 'active'::public.account_status_enum 
                ELSE account_status 
            END,
            debt_amount = CASE 
                WHEN v_tx.type = 'debt_payment' THEN 0 
                ELSE debt_amount 
            END
        WHERE id = v_tx.merchant_id
        RETURNING bouteek_cash_balance INTO v_new_balance;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Transaction approved. Merchant credited.',
            'new_balance', v_new_balance
        );
    ELSE
        -- Reject the transaction
        UPDATE public.wallet_transactions
        SET verification_status = 'REJECTED'
        WHERE id = p_transaction_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Transaction rejected.'
        );
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.topup_with_wave TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_merchant_debt TO authenticated;
GRANT EXECUTE ON FUNCTION public.suspend_merchant TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_merchant TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_verify_transaction TO authenticated;
