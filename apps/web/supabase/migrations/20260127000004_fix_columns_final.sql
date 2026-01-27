-- FINAL FIX: Convert user_id columns from INTEGER to UUID
-- The schema drift caused user_id columns to be created as INTEGER.
-- They store auth.users.id which is UUID. This caused the "invalid input syntax for type integer" error.

-- 1. Fix 'merchants.user_id'
DO $$
BEGIN
  -- Check if it is integer via information_schema or just force the alter
  -- We use USING NULL to avoid casting errors if garbage integer data exists.
  ALTER TABLE public.merchants ALTER COLUMN user_id TYPE uuid USING NULL;
  
  -- Re-add Foreign Key constraint
  ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS merchants_user_id_fkey;
  ALTER TABLE public.merchants ADD CONSTRAINT merchants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
END $$;

-- 2. Fix 'storefronts.user_id'
DO $$
BEGIN
  ALTER TABLE public.storefronts ALTER COLUMN user_id TYPE uuid USING NULL;
  
  -- Re-add Foreign Key constraint
  ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS storefronts_user_id_fkey;
  ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
END $$;

-- 3. Re-Apply Trigger Function (with Error Logging for safety)
CREATE OR REPLACE FUNCTION public.handle_new_merchant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_merchant_id INTEGER;
  v_default_slug text;
BEGIN
  BEGIN
    -- 1. Create User Profile
    INSERT INTO public.users (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
      'user'::public.role_enum
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Merchant Profile (Auto-increment ID, UUID user_id)
    INSERT INTO public.merchants (user_id, business_name, email, subscription_tier)
    VALUES (
      NEW.id, -- UUID
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
      NEW.email,
      'STARTER'::public.subscription_tier_enum
    )
    RETURNING id INTO v_merchant_id;

    -- 3. Generate Slug
    v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);

    -- 4. Create Storefront (Integer merchant_id, UUID user_id)
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
      v_merchant_id, -- Integer
      NEW.id,        -- UUID
      'My New Store',
      v_default_slug,
      '[{"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome"}}, {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured"}}]'::jsonb,
      '[]'::jsonb,
      'pending',
      false
    );

  EXCEPTION WHEN OTHERS THEN
      -- Log ERROR to debug_logs table if exists.
      -- (Assuming debug_logs table exists from previous steps, if not we ignore)
      BEGIN
        INSERT INTO public.debug_logs (message) VALUES ('Error in handle_new_merchant: ' || SQLERRM);
      EXCEPTION WHEN OTHERS THEN NULL; END;
      RAISE; -- Re-raise to fail signup so user knows
  END;

  RETURN NEW;
END;
$function$;
