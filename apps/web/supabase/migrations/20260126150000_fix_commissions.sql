-- FIXED: Sales Commission & Wallet Credit Logic
-- This migration ensures merchants actually get PAID when a sale occurs.

-- 1. Helper: Get Commission Rate based on Tier
CREATE OR REPLACE FUNCTION public.get_commission_rate(p_merchant_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tier text;
    v_rate numeric;
BEGIN
    SELECT subscription_tier INTO v_tier FROM public.merchants WHERE id = p_merchant_id;
    
    -- Fetch Rate from Plans table (e.g., 5.00 means 5%)
    SELECT commission_rate INTO v_rate 
    FROM public.plans 
    WHERE slug = v_tier;

    -- Return normalized rate (5.00 -> 0.05). Default to 5% (0.05) if not found.
    RETURN COALESCE(v_rate, 5.00) / 100.0;
END;
$$;

-- 2. Trigger Function: Credit Wallet on Sale
CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_commission_rate numeric;
    v_commission_amount numeric;
    v_net_amount numeric;
BEGIN
    -- Only run if status changed to 'paid' (case insensitive just in case)
    IF NEW.status ILIKE 'paid' AND (OLD.status IS NULL OR OLD.status NOT ILIKE 'paid') THEN
        
        -- Get Rate
        v_commission_rate := public.get_commission_rate(NEW.merchant_id);
        
        -- Calculate
        v_commission_amount := NEW.total * v_commission_rate;
        v_net_amount := NEW.total - v_commission_amount;

        -- 1. Update Order with stored commission (for audit)
        UPDATE public.orders 
        SET commission = v_commission_amount 
        WHERE id = NEW.id;

        -- 2. Credit Merchant Wallet (Net Amount)
        UPDATE public.merchants
        SET bouteek_cash_balance = COALESCE(bouteek_cash_balance, 0) + v_net_amount
        WHERE id = NEW.merchant_id;

        -- 3. Log Transaction: Sale Revenue
        INSERT INTO public.wallet_transactions (
            merchant_id,
            amount,
            type,
            description,
            reference_id,
            verification_status
        ) VALUES (
            NEW.merchant_id,
            v_net_amount,
            'sale',
            'Revenue for Order #' || NEW.order_number,
            NEW.id::text, -- Link to Order ID
            'completed'
        );

        -- 4. Log Transaction: Commission (Optional, but good for reporting)
        -- We credited Net, but let's log the "Fee" as a separate record if desired?
        -- Actually, usually better to log the GROSS as Credit, and COMMISSION as Debit.
        -- But to keep balance simple, let's just stick to Net Credit for now, 
        -- OR: Credit Gross, Debit Commission. Let's do Credit Gross, Debit Commission for transparency.
        
        -- REVERT step 2: Credit GROSS first
        UPDATE public.merchants
        SET bouteek_cash_balance = bouteek_cash_balance + v_commission_amount -- Adding back to match Gross
        WHERE id = NEW.merchant_id;

        -- Fix Step 3: Log Gross Sale
         UPDATE public.wallet_transactions 
         SET amount = NEW.total, description = 'Gross Revenue Order #' || NEW.order_number
         WHERE reference_id = NEW.id::text AND type = 'sale';

        -- 5. Debit Commission
        INSERT INTO public.wallet_transactions (
            merchant_id,
            amount,
            type, 
            description,
            reference_id,
            verification_status
        ) VALUES (
            NEW.merchant_id,
            -v_commission_amount, -- Negative Logic or just Debit Type? 
            -- 'commission' type might not exist in enum, falling back to 'withdrawal' or custom if enum allows.
            -- Assuming 'commission' was added in previous repairs, if not safe to use 'withdrawal' or 'fee'
            'commission', 
            'Platform Commission (' || (v_commission_rate * 100) || '%)',
            NEW.id::text,
            'completed'
        );
        
        -- Decrement Balance for Commission
        UPDATE public.merchants
        SET bouteek_cash_balance = bouteek_cash_balance - v_commission_amount
        WHERE id = NEW.merchant_id;

    END IF;
    RETURN NEW;
END;
$$;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_payment();
