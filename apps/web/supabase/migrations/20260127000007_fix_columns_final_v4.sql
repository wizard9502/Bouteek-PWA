-- SUPER FINAL DATABASE REPAIR (V4)
-- Solves "foreign key constraint ... cannot be implemented" by dropping specific legacy constraints.

-- A. DROP ALL DEPENDENT POLICIES (Same as V3)
DROP POLICY IF EXISTS "Merchants can view own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Merchants can manage own listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Merchants can manage own staff" ON public.staff;
DROP POLICY IF EXISTS "Public can view active staff" ON public.staff;
DROP POLICY IF EXISTS "Merchants can manage own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can view active rooms" ON public.rooms;
DROP POLICY IF EXISTS "Merchants can view own data" ON public.merchants;
DROP POLICY IF EXISTS "Public can view active merchants" ON public.merchants;


-- B. FIX MERCHANTS TABLE
-- 1. DROP ALL POTENTIAL CONSTRAINTS on user_id
ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS "merchants_userId_users_id_fk"; -- The one reported
ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS "merchants_user_id_fkey";
ALTER TABLE public.merchants DROP CONSTRAINT IF EXISTS "merchants_userId_fkey";

-- 2. Fix user_id (Int -> UUID)
ALTER TABLE public.merchants ALTER COLUMN user_id TYPE uuid USING NULL;

-- 3. Re-add Clean Foreign Key
ALTER TABLE public.merchants ADD CONSTRAINT merchants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


-- C. FIX STOREFRONTS TABLE
-- 1. DROP ALL POTENTIAL CONSTRAINTS on user_id
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS "storefronts_userId_users_id_fk"; -- Guessing counterpart
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS "storefronts_user_id_fkey";
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS "storefronts_userId_fkey";

-- 2. Fix user_id (Int -> UUID)
ALTER TABLE public.storefronts ALTER COLUMN user_id TYPE uuid USING NULL;
ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 3. Fix merchant_id (Ensure INTEGER and Foreign Key)
ALTER TABLE public.storefronts DROP CONSTRAINT IF EXISTS storefronts_merchant_id_fkey;
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='merchant_id') THEN
      ALTER TABLE public.storefronts ADD COLUMN merchant_id INTEGER;
  ELSE
      ALTER TABLE public.storefronts ALTER COLUMN merchant_id TYPE INTEGER USING NULL;
  END IF;
END $$;
ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


-- D. FIX WALLET TABLES (If exist)
DO $$ 
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
      ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_merchant_id_fkey;
      ALTER TABLE public.wallet_transactions ALTER COLUMN merchant_id TYPE INTEGER USING NULL;
      ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);
  END IF;
END $$;


-- E. RESTORE POLICIES
CREATE POLICY "Merchants can view own data" ON public.merchants FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view own transactions" ON public.wallet_transactions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.merchants WHERE id = wallet_transactions.merchant_id AND user_id = auth.uid()));

CREATE POLICY "Merchants can manage own listings" ON public.listings FOR ALL 
  USING (store_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can manage own staff" ON public.staff FOR ALL 
  USING (store_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can manage own rooms" ON public.rooms FOR ALL 
  USING (store_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Public can view active listings" ON public.listings FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active staff" ON public.staff FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active rooms" ON public.rooms FOR SELECT USING (is_active = true);


-- F. UPDATE TRIGGER
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

    -- 2. Create Merchant
    INSERT INTO public.merchants (user_id, business_name, email, subscription_tier)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Merchant'),
      NEW.email,
      'STARTER'::public.subscription_tier_enum
    )
    RETURNING id INTO v_merchant_id;

    -- 3. Create Storefront
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
      BEGIN
        INSERT INTO public.debug_logs (message) VALUES ('Error in handle_new_merchant: ' || SQLERRM);
      EXCEPTION WHEN OTHERS THEN NULL; END;
      RAISE; 
  END;

  RETURN NEW;
END;
$function$;
