-- Create a table for wallet transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  amount integer NOT NULL, -- Positive for add, negative for deduct
  type text NOT NULL, -- 'topup', 'subscription', 'commission', 'sale', 'withdrawal'
  description text,
  reference_id text, -- e.g., order_id or external_payment_id
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own transactions" 
  ON public.wallet_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.merchants 
    WHERE id = wallet_transactions.merchant_id 
    AND user_id = auth.uid()
  ));

-- Add referral code to merchants if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'referral_code') THEN 
        ALTER TABLE public.merchants ADD COLUMN referral_code text UNIQUE; 
    END IF; 
END $$;

-- function to handle subscription purchase safely
CREATE OR REPLACE FUNCTION public.purchase_subscription(
  p_merchant_id uuid,
  p_plan_tier public.subscription_tier_enum,
  p_cost integer,
  p_duration_months integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance integer;
  v_new_end_date timestamptz;
BEGIN
  -- Get current balance
  SELECT bouteek_cash_balance INTO v_current_balance
  FROM public.merchants
  WHERE id = p_merchant_id;

  IF v_current_balance < p_cost THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  -- Deduct balance
  UPDATE public.merchants
  SET bouteek_cash_balance = bouteek_cash_balance - p_cost
  WHERE id = p_merchant_id;

  -- Calculate new end date (if already active, add to current end date, else now + duration)
  SELECT 
    CASE 
      WHEN subscription_end > now() THEN subscription_end + (p_duration_months || ' months')::interval
      ELSE now() + (p_duration_months || ' months')::interval
    END
  INTO v_new_end_date
  FROM public.merchants
  WHERE id = p_merchant_id;

  -- Update subscription
  UPDATE public.merchants
  SET 
    subscription_tier = p_plan_tier,
    subscription_start = COALESCE(subscription_start, now()),
    subscription_end = v_new_end_date
  WHERE id = p_merchant_id;

  -- Log transaction
  INSERT INTO public.wallet_transactions (merchant_id, amount, type, description)
  VALUES (p_merchant_id, -p_cost, 'subscription', 'Subscription to ' || p_plan_tier);

  RETURN jsonb_build_object('success', true, 'new_balance', v_current_balance - p_cost, 'expires_at', v_new_end_date);
END;
$$;
