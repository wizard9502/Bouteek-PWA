-- DATA INTEGRITY REPAIR MIGRATION
-- Use this to fix missing tables and columns identified in the audit.

-- 1. Restore 'affiliate_payouts' table if property missing
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id uuid REFERENCES public.merchants(id),
    referred_user_id uuid REFERENCES public.users(id),
    amount integer NOT NULL,
    status text DEFAULT 'pending' NOT NULL, -- pending, approved, paid, cancelled
    created_at timestamptz DEFAULT now() NOT NULL,
    processed_at timestamptz,
    processed_by uuid REFERENCES public.users(id)
);
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- 2. Ensure 'merchants' has required columns (snake_case)
-- If your DB has camelCase columns (e.g. "businessName"), you may need to migrate data.
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier_enum DEFAULT 'starter';

-- 3. Ensure 'orders' has commission
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission integer DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total integer DEFAULT 0;

-- 4. Ensure 'wallet_transactions' has types
-- Check if enum exists first? It usually fails if exists.
-- ALTER TYPE public.transaction_type_enum ADD VALUE IF NOT EXISTS 'commission';

-- 5. Restore policies for new table
CREATE POLICY "Admins can manage payouts" ON public.affiliate_payouts
    FOR ALL USING (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );
