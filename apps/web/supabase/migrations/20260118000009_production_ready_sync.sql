-- Migration: Production Readiness Sync
-- 1. Add SKU to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;

-- 2. Add Receipt Config to storefronts
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS receipt_config jsonb DEFAULT '{
    "showLogo": true,
    "showQRCode": true,
    "showSocial": true,
    "customMessage": "Merci de votre achat !",
    "accentColor": "#00D632"
}'::jsonb;

-- 3. Merchant Coupons (Promotions Engine)
CREATE TABLE IF NOT EXISTS public.merchant_coupons (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    code text NOT NULL,
    type text NOT NULL CHECK (type IN ('fixed', 'percentage')),
    value numeric NOT NULL,
    status text DEFAULT 'active', -- 'active', 'expired', 'scheduled'
    usage_count integer DEFAULT 0,
    max_usage integer,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(merchant_id, code)
);

-- Enable RLS for Coupons
ALTER TABLE public.merchant_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants manage own coupons" ON public.merchant_coupons
    USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- 4. Product Reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    customer_name text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    response text,
    responded_at timestamptz,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for Reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants manage own reviews" ON public.product_reviews
    USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));
CREATE POLICY "Public can view approved reviews" ON public.product_reviews
    FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit review" ON public.product_reviews
    FOR INSERT WITH CHECK (true);

-- 5. Inventory Sync Channels
CREATE TABLE IF NOT EXISTS public.inventory_channels (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL, -- 'Instagram', 'POS', 'Facebook', etc.
    status text DEFAULT 'connected', -- 'connected', 'disconnected', 'syncing'
    last_sync timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(merchant_id, name)
);

-- Enable RLS for Channels
ALTER TABLE public.inventory_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants manage own channels" ON public.inventory_channels
    USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- 6. Add referred_by_code to users if missing (redundant check)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by_code text;
