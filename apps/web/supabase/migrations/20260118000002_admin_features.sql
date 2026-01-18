-- Admin & System Schema

-- 1. System Settings (Single row or Key-Value)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES public.users(id)
);

-- Initialize default settings
INSERT INTO public.system_settings (key, value)
VALUES 
    ('general', '{"free_trial_enabled": true, "maintenance_mode": false}'),
    ('subscription_pricing', '{
        "starter": {"price": 2000, "commission_rate": 0.05},
        "launch": {"price": 5000, "commission_rate": 0.03},
        "growth": {"price": 12500, "commission_rate": 0.015},
        "pro": {"price": 20000, "commission_rate": 0.0075}
    }')
ON CONFLICT (key) DO NOTHING;

-- 2. Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id uuid REFERENCES public.users(id) NOT NULL,
    action text NOT NULL, -- e.g., 'VERIFY_MERCHANT', 'BAN_MERCHANT'
    target_type text NOT NULL, -- e.g., 'merchant', 'user'
    target_id text,
    details jsonb, -- existing value, new value, reason etc.
    ip_address text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Promo Codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    value numeric NOT NULL,
    type text NOT NULL CHECK (type IN ('fixed', 'percentage')),
    max_uses integer DEFAULT 1,
    used_count integer DEFAULT 0,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES public.users(id)
);

-- 4. Notification Campaigns
CREATE TABLE IF NOT EXISTS public.notification_campaigns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    body text NOT NULL,
    target_audience text NOT NULL, -- 'all', 'merchants', 'admins', 'specific'
    template_type text, -- 'security', 'marketing', 'system'
    status text DEFAULT 'draft', -- 'draft', 'sent'
    sent_at timestamptz,
    recipient_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES public.users(id)
);

-- 5. Affiliate Payouts
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id uuid REFERENCES public.merchants(id),
    referred_user_id uuid REFERENCES public.users(id),
    amount numeric NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
    created_at timestamptz DEFAULT now(),
    processed_at timestamptz,
    processed_by uuid REFERENCES public.users(id)
);

-- RLS Policies (Simplified for Admin usage)
-- In a real app, we'd strict check for admin role in public.users
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Allow read/write for now (User should ideally add 'role' check)
CREATE POLICY "Allow all access to authenticated users for now" ON public.system_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users for now" ON public.admin_audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users for now" ON public.promo_codes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users for now" ON public.notification_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users for now" ON public.affiliate_payouts FOR ALL USING (auth.role() = 'authenticated');
