-- Migration: Growth Tools (SEO, Analytics, Team)
-- 1. SEO Configuration for Storefronts
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS meta_keywords text,
ADD COLUMN IF NOT EXISTS social_image_url text;

-- 2. Store Staff / Collaboration
CREATE TABLE IF NOT EXISTS public.store_staff (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'editor', -- 'admin', 'editor', 'viewer'
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(merchant_id, user_id)
);

-- Enable RLS for Staff
ALTER TABLE public.store_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants manage their own staff" ON public.store_staff
    USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- 3. Storefront Analytics (Heatmaps / Click Tracking)
CREATE TABLE IF NOT EXISTS public.storefront_analytics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    storefront_id uuid REFERENCES public.storefronts(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL, -- 'click', 'view', 'add_to_cart'
    element_id text,
    page_path text,
    x_pos integer,
    y_pos integer,
    device_type text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for Analytics
ALTER TABLE public.storefront_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants view own store analytics" ON public.storefront_analytics
    FOR SELECT USING (storefront_id IN (SELECT id FROM public.storefronts WHERE merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())));

CREATE POLICY "Public can log analytics" ON public.storefront_analytics
    FOR INSERT WITH CHECK (true);

-- 4. Fix possible inconsistencies in wallet_transactions
-- Checking if column 'type' exists, renaming to 'transaction_type' if needed for consistency with Major Upgrades
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallet_transactions' AND column_name='type') THEN
        ALTER TABLE public.wallet_transactions RENAME COLUMN "type" TO "transaction_type";
    END IF;
END $$;

-- Also add reference_id if missing (it was used in commission logic trigger)
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS reference_id text;
