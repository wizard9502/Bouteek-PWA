-- SUPER FINAL DATABASE REPAIR
-- Fixes:
-- 1. merchants.user_id (Int -> UUID) [Blocked by Policy]
-- 2. storefronts.user_id (Int -> UUID)
-- 3. wallet_transactions.merchant_id (UUID -> Int) [To match merchants.id]
-- 4. Re-creates dropped Policies.
-- 5. Updates Trigger logic.

-- A. DROP POLICIES / CONSTRAINTS BLOCKING CHANGES
DROP POLICY IF EXISTS "Merchants can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Merchants can view own data" ON public.merchants;

-- B. FIX MERCHANTS TABLE
-- 1. Fix user_id (Int -> UUID)
ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS merchants_user_id_fkey;
ALTER TABLE public.merchants ALTER COLUMN user_id TYPE uuid USING NULL;
ALTER TABLE public.merchants ADD CONSTRAINT merchants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- C. FIX STOREFRONTS TABLE
-- 1. Fix user_id (Int -> UUID)
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS storefronts_user_id_fkey;
ALTER TABLE public.storefronts ALTER COLUMN user_id TYPE uuid USING NULL;
ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 2. Ensure merchant_id is INTEGER (Foreign Key)
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS storefronts_merchant_id_fkey;
DO $$ 
BEGIN
  -- If usage matches, we might need to drop column and re-add if conversion fails hard
  -- But usually just changing type works via USING NULL
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='merchant_id' AND data_type='uuid') THEN
      ALTER TABLE public.storefronts ALTER COLUMN merchant_id TYPE INTEGER USING NULL;
  END IF;
  
  -- If missing, add it
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='merchant_id') THEN
      ALTER TABLE public.storefronts ADD COLUMN merchant_id INTEGER;
  END IF;
END $$;
-- Add FK
ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


-- D. FIX WALLET_TRANSACTIONS TABLE (If exists)
DO $$ 
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
      -- Drop old FK validity check
      ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_merchant_id_fkey;
      
      -- Convert merchant_id to INTEGER (to match merchants.id)
      ALTER TABLE public.wallet_transactions ALTER COLUMN merchant_id TYPE INTEGER USING NULL;
      
      -- Add FK
      ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);
  END IF;
END $$;


-- E. RESTORE POLICIES
-- 1. Merchants can view own transactions
-- (Depends on merchants.user_id being correct UUID now)
CREATE POLICY "Merchants can view own transactions" 
  ON public.wallet_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.merchants 
    WHERE id = wallet_transactions.merchant_id 
    AND user_id = auth.uid()
  ));

-- 2. Merchants can view own data (Standard policy)
CREATE POLICY "Merchants can view own data" 
  ON public.merchants 
  FOR ALL 
  USING (auth.uid() = user_id);


-- F. UPDATE TRIGGER (Final Version)
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
    -- 1. Create User
    INSERT INTO public.users (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
      'user'::public.role_enum
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Merchant (Integer ID, UUID user_id)
    INSERT INTO public.merchants (user_id, business_name, email, subscription_tier)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
      NEW.email,
      'STARTER'::public.subscription_tier_enum
    )
    RETURNING id INTO v_merchant_id;

    -- 3. Create Storefront (Integer merchant_id, UUID user_id)
    v_default_slug := 'store-' || substr(md5(random()::text), 1, 6);
    
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
      v_merchant_id, 
      NEW.id,        
      'My New Store',
      v_default_slug,
      '[{"id": "hero-1", "type": "hero", "enabled": true, "settings": {"headline": "Welcome"}}, {"id": "grid-1", "type": "product_grid", "enabled": true, "settings": {"title": "Featured"}}]'::jsonb,
      '[]'::jsonb,
      'pending',
      false
    );

  EXCEPTION WHEN OTHERS THEN
      -- Log error safely
      BEGIN
        INSERT INTO public.debug_logs (message) VALUES ('Error in handle_new_merchant: ' || SQLERRM);
      EXCEPTION WHEN OTHERS THEN NULL; END;
      RAISE; 
  END;

  RETURN NEW;
END;
$function$;
