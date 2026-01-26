-- Migration: Fix Onboarding Trigger & Ensure Layout Config
-- 1. Ensure layout_config column exists (alias/migration for layout_blocks if needed)
DO $$ 
BEGIN
  -- If layout_config doesn't exist but layout_blocks does, we can either rename or add alias.
  -- The user asked specifically for 'layout_config'. Let's add it if missing.
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'storefronts' AND column_name = 'layout_config') THEN
    ALTER TABLE public.storefronts ADD COLUMN layout_config jsonb DEFAULT '[]'::jsonb;
    
    -- Sync existing data if layout_blocks exists
    -- UPDATE public.storefronts SET layout_config = layout_blocks WHERE layout_blocks IS NOT NULL;
  END IF;
END $$;

-- 2. Create Trigger Function for New User Onboarding
CREATE OR REPLACE FUNCTION public.handle_new_merchant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_merchant_id uuid;
  v_default_slug text;
BEGIN
  -- 1. Create Merchant Profile
  INSERT INTO public.merchants (id, user_id, name, email, subscription_tier)
  VALUES (
    NEW.id, -- Use auth.uid as merchant id (1:1 mapping simplification for MPV) or gen random
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    NEW.email,
    'starter'
  )
  RETURNING id INTO v_merchant_id;

  -- 2. Generate Default Slug (e.g. merchant-1234)
  v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);

  -- 3. Create Storefront with "Lego" Layout
  INSERT INTO public.storefronts (
    merchant_id, 
    name, 
    slug, 
    layout_config, -- The requested column
    layout_blocks, -- Keep legacy for backward compat if code uses it
    custom_domain_status
  )
  VALUES (
    v_merchant_id,
    'My New Store',
    v_default_slug,
    '[
      {"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome to my store", "subheadline": "Best products in town"}},
      {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured Products"}}
    ]'::jsonb,
    '[
      {"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome to my store", "subheadline": "Best products in town"}},
      {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured Products"}}
    ]'::jsonb,
    'pending'
  );

  RETURN NEW;
END;
$$;

-- 3. Attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_merchant();
