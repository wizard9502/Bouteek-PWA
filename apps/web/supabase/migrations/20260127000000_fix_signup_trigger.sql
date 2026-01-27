-- Fix Signup Trigger: Insert into public.users BEFORE public.merchants
-- Context: public.merchants.user_id references public.users.id
-- Previous trigger implementation skipped public.users insert, causing FK violation.

CREATE OR REPLACE FUNCTION public.handle_new_merchant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_merchant_id uuid;
  v_default_slug text;
BEGIN
  -- 1. Create User Profile (REQUIRED due to FK)
  -- Uses ON CONFLICT to be safe if previously inserted by another trigger (though we dropped the old one)
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    'user'::public.role_enum
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Merchant Profile
  INSERT INTO public.merchants (id, user_id, business_name, email, subscription_tier)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    NEW.email,
    'STARTER'::public.subscription_tier_enum
  )
  RETURNING id INTO v_merchant_id;

  -- 3. Generate Default Slug
  v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);

  -- 4. Create Storefront
  INSERT INTO public.storefronts (
    merchant_id, 
    name, 
    slug, 
    layout_config, 
    layout_blocks, 
    custom_domain_status
  )
  VALUES (
    v_merchant_id,
    'My New Store',
    v_default_slug,
    '[{"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome"}}, {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured"}}]'::jsonb,
    '[]'::jsonb,
    'pending'
  );

  RETURN NEW;
END;
$function$;
