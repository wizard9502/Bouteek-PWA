-- Migration: Auto-deduct commission on order payment
-- 1. Create function to calculate and deduct commission
CREATE OR REPLACE FUNCTION public.handle_order_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_merchant_id uuid; -- Changed to uuid to match merchants.id type if it was uuid, checking schema... wait, merchants.id is uuid in schema? Let me double check.
  -- Re-checking schema from previous turns. 
  -- public.merchants.id is UUID (default uuid_generate_v4()).
  -- public.orders.merchant_id is UUID.
  
  v_subscription_tier public.subscription_tier_enum;
  v_commission_rate numeric;
  v_commission_amount integer;
  v_order_total integer;
BEGIN
  -- Only proceed if status is changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    
    -- Get merchant details
    SELECT subscription_tier, bouteek_cash_balance
    INTO v_subscription_tier
    FROM public.merchants
    WHERE id = NEW.merchant_id;

    -- Determine commission rate
    CASE v_subscription_tier
      WHEN 'starter' THEN v_commission_rate := 0.05;
      WHEN 'launch' THEN v_commission_rate := 0.03;
      WHEN 'growth' THEN v_commission_rate := 0.01;
      WHEN 'pro' THEN v_commission_rate := 0.00;
      ELSE v_commission_rate := 0.05; -- Default to 5% if unspecified
    END CASE;

    -- Calculate commission (rounding up to ensure we cover costs)
    v_order_total := NEW.total; -- Correct column name is 'total'
    v_commission_amount := CEIL(v_order_total * v_commission_rate);

    -- If commission is > 0, deduct it
    IF v_commission_amount > 0 THEN
      -- Deduct from wallet
      UPDATE public.merchants
      SET bouteek_cash_balance = bouteek_cash_balance - v_commission_amount
      WHERE id = NEW.merchant_id;

      -- Log transaction
      INSERT INTO public.wallet_transactions (
        merchant_id,
        amount,
        type,
        description,
        reference_id
      ) VALUES (
        NEW.merchant_id,
        -v_commission_amount,
        'commission',
        'Commission for Order #' || NEW.order_number || ' (' || (v_commission_rate * 100) || '%)',
        NEW.id::text
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS on_order_paid ON public.orders;
CREATE TRIGGER on_order_paid
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_payment();
