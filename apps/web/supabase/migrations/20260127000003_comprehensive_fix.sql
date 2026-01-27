-- COMPREHENSIVE FIX for Signup 500 Error
-- Addresses:
-- 1. Schema Drift: 'merchants' has properties of INTEGER PK and mismatched column names.
-- 2. Schema Drift: 'storefronts' missing 'merchant_id' and using 'userId'.
-- 3. Trigger Logic: Was failing by trying to force UUID into Integer PK.

-- PART 1: Fix 'storefronts' Table Schema
-- Rename userId -> user_id
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='userId') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;

-- Add merchant_id (INTEGER to match merchants.id)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='merchant_id') THEN
    ALTER TABLE public.storefronts ADD COLUMN merchant_id INTEGER REFERENCES public.merchants(id);
  END IF;
END $$;

-- Fix CamelCase columns in 'storefronts'
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='isPublished') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "isPublished" TO is_published;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='themeSettings') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "themeSettings" TO theme_settings;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='createdAt') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "createdAt" TO created_at;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='updatedAt') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;


-- PART 2: Update Trigger Function to handle INTEGER ID
CREATE OR REPLACE FUNCTION public.handle_new_merchant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_merchant_id INTEGER; -- Changed from uuid to INTEGER
  v_default_slug text;
BEGIN
  -- 1. Create User Profile (REQUIRED)
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    'user'::public.role_enum
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Merchant Profile
  -- IMPORTANT: Do NOT insert 'id'. Let Serial auto-increment.
  INSERT INTO public.merchants (user_id, business_name, email, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    NEW.email,
    'STARTER'::public.subscription_tier_enum
  )
  RETURNING id INTO v_merchant_id; -- Capture the generated Integer ID

  -- 3. Generate Default Slug
  v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);

  -- 4. Create Storefront
  INSERT INTO public.storefronts (
    merchant_id, 
    user_id,
    name, 
    slug, 
    layout_config, 
    layout_blocks, 
    custom_domain_status,
    is_published
  )
  VALUES (
    v_merchant_id, -- Integer ID
    NEW.id,        -- UUID User ID
    'My New Store',
    v_default_slug,
    '[{"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome"}}, {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured"}}]'::jsonb,
    '[]'::jsonb,
    'pending',
    false
  );

  RETURN NEW;
END;
$function$;
