-- Migration: Enterprise Features
-- Adds team collaboration, audit logging, and updates plan structure

-- 1. Create team_members table for RBAC
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by INTEGER REFERENCES public.users(id),
    invite_token TEXT UNIQUE,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, email)
);

COMMENT ON TABLE public.team_members IS 'Team member access for merchants with RBAC roles';
COMMENT ON COLUMN public.team_members.role IS 'admin=full control, editor=content/pricing, viewer=analytics only';

-- 2. Create merchant_audit_logs for action tracking
CREATE TABLE IF NOT EXISTS public.merchant_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'listing', 'order', 'settings', 'storefront'
    target_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.merchant_audit_logs IS 'Audit trail of all merchant dashboard actions';

CREATE INDEX idx_merchant_audit_logs_merchant ON public.merchant_audit_logs(merchant_id);
CREATE INDEX idx_merchant_audit_logs_created ON public.merchant_audit_logs(created_at DESC);

-- 3. Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_shipping')),
    value DECIMAL(10, 2), -- discount amount or percentage
    buy_quantity INTEGER, -- for buy_x_get_y
    get_quantity INTEGER, -- for buy_x_get_y
    min_order_value DECIMAL(10, 2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    applies_to TEXT DEFAULT 'all', -- 'all', 'specific_listings', 'category'
    listing_ids UUID[],
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.promotions IS 'Merchant promotions, discounts, and campaigns';

CREATE INDEX idx_promotions_merchant ON public.promotions(merchant_id);
CREATE INDEX idx_promotions_code ON public.promotions(code) WHERE code IS NOT NULL;

-- 4. Create receipt_templates table
CREATE TABLE IF NOT EXISTS public.receipt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id INTEGER REFERENCES public.merchants(id) ON DELETE CASCADE UNIQUE,
    template_data JSONB NOT NULL DEFAULT '{
        "show_logo": true,
        "header_text": "",
        "footer_text": "Thank you for your purchase!",
        "show_social_links": true,
        "accent_color": "#000000"
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.receipt_templates IS 'Customizable receipt templates per merchant';

-- 5. Update plans table with new features and pricing
-- First, add module_limits column if not exists
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS module_limits JSONB DEFAULT '{}'::jsonb;

-- Update existing plans to match spec
UPDATE public.plans SET 
    price = 2000,
    features = jsonb_build_object(
        'max_modules', 1,
        'basic_stats', true,
        'standard_seo', true,
        'customer_reviews', false,
        'pdf_csv_reports', false,
        'team_seats', 0,
        'rbac', false,
        'promotions_engine', false,
        'receipt_builder', false,
        'heatmaps', false,
        'audit_logs', false,
        'realtime_collab', false
    ),
    limits = jsonb_build_object('products', 25, 'staff', 1, 'modules', 1)
WHERE slug = 'launch' OR (slug = 'starter' AND price = 0);

-- If 'launch' doesn't exist, insert it
INSERT INTO public.plans (name, slug, price, features, limits)
VALUES (
    'Launch', 'launch', 2000,
    '{"max_modules": 1, "basic_stats": true, "standard_seo": true, "customer_reviews": false, "pdf_csv_reports": false, "team_seats": 0, "rbac": false, "promotions_engine": false, "receipt_builder": false, "heatmaps": false, "audit_logs": false, "realtime_collab": false}'::jsonb,
    '{"products": 25, "staff": 1, "modules": 1}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- Starter: 5,000 XOF
INSERT INTO public.plans (name, slug, price, features, limits)
VALUES (
    'Starter', 'starter', 5000,
    '{"max_modules": 1, "basic_stats": true, "standard_seo": true, "customer_reviews": true, "pdf_csv_reports": true, "team_seats": 0, "rbac": false, "promotions_engine": false, "receipt_builder": false, "heatmaps": false, "audit_logs": false, "realtime_collab": false}'::jsonb,
    '{"products": 50, "staff": 1, "modules": 1}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- Growth: 12,500 XOF
INSERT INTO public.plans (name, slug, price, features, limits)
VALUES (
    'Growth', 'growth', 12500,
    '{"max_modules": -1, "basic_stats": true, "standard_seo": true, "customer_reviews": true, "pdf_csv_reports": true, "team_seats": 5, "rbac": true, "promotions_engine": true, "receipt_builder": true, "heatmaps": false, "audit_logs": false, "realtime_collab": false}'::jsonb,
    '{"products": -1, "staff": 5, "modules": -1}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- Pro: 20,000 XOF
INSERT INTO public.plans (name, slug, price, features, limits)
VALUES (
    'Pro', 'pro', 20000,
    '{"max_modules": -1, "basic_stats": true, "standard_seo": true, "customer_reviews": true, "pdf_csv_reports": true, "team_seats": -1, "rbac": true, "promotions_engine": true, "receipt_builder": true, "heatmaps": true, "audit_logs": true, "realtime_collab": true}'::jsonb,
    '{"products": -1, "staff": -1, "modules": -1}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- 6. RLS Policies

-- Team members: merchant admins can manage, members can read own
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read own membership"
    ON public.team_members FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE "authId" = auth.uid()));

CREATE POLICY "Merchant admins can manage team"
    ON public.team_members FOR ALL
    USING (
        merchant_id IN (
            SELECT id FROM merchants WHERE "userId" = auth.uid()
        )
        OR 
        (user_id IN (SELECT id FROM users WHERE "authId" = auth.uid()) AND role = 'admin')
    );

-- Merchant audit logs: merchant owners and team can read
ALTER TABLE public.merchant_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant and team can read audit logs"
    ON public.merchant_audit_logs FOR SELECT
    USING (
        merchant_id IN (SELECT id FROM merchants WHERE "userId" = auth.uid())
        OR
        merchant_id IN (SELECT merchant_id FROM team_members WHERE user_id IN (SELECT id FROM users WHERE "authId" = auth.uid()))
    );

CREATE POLICY "System can insert audit logs"
    ON public.merchant_audit_logs FOR INSERT
    WITH CHECK (true);

-- Promotions: merchant and team can manage
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant can manage promotions"
    ON public.promotions FOR ALL
    USING (
        merchant_id IN (SELECT id FROM merchants WHERE "userId" = auth.uid())
        OR
        merchant_id IN (
            SELECT merchant_id FROM team_members 
            WHERE user_id IN (SELECT id FROM users WHERE "authId" = auth.uid())
            AND role IN ('admin', 'editor')
        )
    );

-- Receipt templates: merchant can manage
ALTER TABLE public.receipt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant can manage receipt template"
    ON public.receipt_templates FOR ALL
    USING (
        merchant_id IN (SELECT id FROM merchants WHERE "userId" = auth.uid())
    );

-- 7. Function to log merchant actions
CREATE OR REPLACE FUNCTION public.log_merchant_action(
    p_merchant_id INTEGER,
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id TEXT DEFAULT NULL,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id INTEGER;
    v_log_id UUID;
BEGIN
    -- Get user ID from auth
    SELECT id INTO v_user_id FROM users WHERE "authId" = auth.uid();
    
    INSERT INTO public.merchant_audit_logs (
        merchant_id, user_id, action, target_type, target_id, old_value, new_value
    ) VALUES (
        p_merchant_id, v_user_id, p_action, p_target_type, p_target_id, p_old_value, p_new_value
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;
