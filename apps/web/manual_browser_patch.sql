-- SAFE FOUNDATION PATCH
-- Run this in Supabase SQL Editor

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums (Idempotent approach using DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE public.role_enum AS ENUM ('user', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier_enum') THEN
        CREATE TYPE public.subscription_tier_enum AS ENUM ('starter', 'launch', 'growth', 'pro');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE public.product_type_enum AS ENUM ('sale', 'rent', 'service', 'event');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE public.order_status_enum AS ENUM ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
        CREATE TYPE public.payment_type_enum AS ENUM ('wave', 'orange_money');
    END IF;
END$$;

-- 3. Ensure Merchants Table has correct columns and types
CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  business_name text,
  email text,
  subscription_tier public.subscription_tier_enum DEFAULT 'starter',
  created_at timestamptz DEFAULT now()
);

-- Fix columns if table exists but columns missing or wrong type
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier_enum DEFAULT 'starter';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS bouteek_cash_balance integer DEFAULT 0;

-- 4. Ensure Storefronts
CREATE TABLE IF NOT EXISTS public.storefronts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id uuid REFERENCES public.merchants(id),
  slug text,
  layout_config jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS layout_config jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.storefronts ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- 5. Trigger Function (RE-APPLY to be safe)
CREATE OR REPLACE FUNCTION public.handle_new_merchant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_merchant_id uuid;
  v_default_slug text;
BEGIN
  -- Insert with explicit columns
  INSERT INTO public.merchants (id, user_id, business_name, email, subscription_tier)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
    NEW.email,
    'starter'::public.subscription_tier_enum
  )
  RETURNING id INTO v_merchant_id;

  v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);

  INSERT INTO public.storefronts (merchant_id, name, slug, layout_config, layout_blocks, custom_domain_status)
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
$$;

-- 6. Grant Permissions (Fix 500s due to permissions)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
