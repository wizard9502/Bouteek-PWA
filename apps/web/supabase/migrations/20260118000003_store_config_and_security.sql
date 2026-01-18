-- 1. Update Storefronts for Builder
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS template_id text DEFAULT 'modern_minimal',
ADD COLUMN IF NOT EXISTS theme_config jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enable_testimonials boolean DEFAULT false;

-- 2. Secure Admin Tables (Update RLS)
-- First, drop the permissive policies
DROP POLICY IF EXISTS "Allow all access to authenticated users for now" ON public.system_settings;
DROP POLICY IF EXISTS "Allow all access to authenticated users for now" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Allow all access to authenticated users for now" ON public.promo_codes;
DROP POLICY IF EXISTS "Allow all access to authenticated users for now" ON public.notification_campaigns;
DROP POLICY IF EXISTS "Allow all access to authenticated users for now" ON public.affiliate_payouts;

-- Create Admin-Only Policies
-- Note: usage of EXISTS to check role in users table
CREATE POLICY "Admins only system_settings" ON public.system_settings
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins only admin_audit_logs" ON public.admin_audit_logs
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins only promo_codes" ON public.promo_codes
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins only notification_campaigns" ON public.notification_campaigns
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins only affiliate_payouts" ON public.affiliate_payouts
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 3. Ensure Merchant has 'storefronts' record on creation (Trigger or doing it manually)
-- For now, we assume it's created, but let's make sure our builder page can handle upsert.
