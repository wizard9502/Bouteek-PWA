-- Migration: Commerce Engine Finalization
-- Adds payment_methods to storefronts, enhances orders table

-- 1. Add payment_methods column to storefronts for mobile money config
ALTER TABLE public.storefronts
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{
  "orange_money": {"phone": "", "enabled": false},
  "wave": {"phone": "", "enabled": false}
}'::jsonb;

COMMENT ON COLUMN public.storefronts.payment_methods IS 'Mobile money payment configuration (Orange Money, Wave)';

-- 2. Add transaction tracking to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

COMMENT ON COLUMN public.orders.transaction_id IS 'Mobile money transaction ID for verification';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (orange_money, wave, etc)';

-- 3. RLS Policies for public listing access
-- Drop existing if any to avoid conflicts
DROP POLICY IF EXISTS "Public read active listings" ON public.listings;
DROP POLICY IF EXISTS "Owner can manage listings" ON public.listings;

-- Enable RLS on listings table
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public read for active listings (for storefront)
CREATE POLICY "Public read active listings"
  ON public.listings
  FOR SELECT
  USING (is_active = true);

-- Owner can manage their own listings
CREATE POLICY "Owner can manage listings"
  ON public.listings
  FOR ALL
  USING (
    store_id IN (
      SELECT id FROM merchants WHERE "userId" = auth.uid()
    )
  );

-- 4. RLS for storefronts - public read
DROP POLICY IF EXISTS "Public read storefronts" ON public.storefronts;
DROP POLICY IF EXISTS "Owner can manage storefront" ON public.storefronts;

ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read storefronts"
  ON public.storefronts
  FOR SELECT
  USING (true);

CREATE POLICY "Owner can manage storefront"
  ON public.storefronts
  FOR ALL
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE "userId" = auth.uid()
    )
  );

-- 5. Index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON public.orders(merchant_id, status);

-- 6. Add order status enum if not exists
DO $$ BEGIN
  -- Check if column exists before altering
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'orders' AND column_name = 'status') THEN
    -- Ensure status can hold our values
    NULL;
  ELSE
    ALTER TABLE public.orders ADD COLUMN status TEXT DEFAULT 'pending_verification';
  END IF;
END $$;
