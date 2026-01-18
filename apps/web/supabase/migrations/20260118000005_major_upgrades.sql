-- Migration: Major Upgrades (Wallet, Subscription, Referrals, Indexes)

-- 1. Merchant Enhancements
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS bouteek_cash_balance numeric(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_expiry timestamptz,
ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT false;

-- 2. Wallet Transactions History
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
    amount numeric(12,2) NOT NULL, -- Positive for credit, negative for debit
    description text NOT NULL,
    transaction_type text NOT NULL, -- 'subscription_payment', 'commission', 'topup', 'adjustment'
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for Wallet Transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants view own transactions" ON public.wallet_transactions
    FOR SELECT USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchants_referral_code ON public.merchants(referral_code);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_merchant_id ON public.wallet_transactions(merchant_id);

