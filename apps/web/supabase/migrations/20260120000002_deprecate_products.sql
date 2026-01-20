-- Migration: Deprecate Products Table
-- The products table is replaced by the unified listings table
-- This migration:
-- 1. Migrates existing products to listings
-- 2. Renames products table to products_deprecated
-- 3. Creates a view for backwards compatibility

-- Step 1: Migrate existing products to listings
INSERT INTO public.listings (
  store_id,
  module_type,
  title,
  description,
  base_price,
  media_urls,
  category,
  is_active,
  is_featured,
  metadata,
  created_at,
  updated_at
)
SELECT 
  p.merchant_id as store_id,
  CASE 
    WHEN p.product_type = 'rent' THEN 'rental'::listing_module_enum
    WHEN p.product_type = 'service' THEN 'service'::listing_module_enum
    ELSE 'sale'::listing_module_enum
  END as module_type,
  p.name as title,
  p.description,
  COALESCE(p.price, 0) as base_price,
  COALESCE(p.images, '{}')::jsonb as media_urls,
  p.category,
  p.is_active,
  false as is_featured,
  CASE 
    WHEN p.product_type IN ('sale', 'event') OR p.product_type IS NULL THEN 
      jsonb_build_object(
        'variants', COALESCE(p.variants, '[]'::jsonb),
        'stock_level', COALESCE(p.stock_quantity, 0),
        'weight', null
      )
    WHEN p.product_type = 'rent' THEN
      jsonb_build_object(
        'deposit_amount', 0,
        'rental_unit', 'day',
        'min_period', 1,
        'require_id_verification', false
      )
    WHEN p.product_type = 'service' THEN
      jsonb_build_object(
        'duration_minutes', 60,
        'buffer_time_before', 0,
        'buffer_time_after', 0,
        'allow_specialist_selection', false,
        'assigned_staff_ids', '[]'::jsonb
      )
    ELSE '{}'::jsonb
  END as metadata,
  p.created_at,
  p.updated_at
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.listings l 
  WHERE l.title = p.name 
    AND l.store_id = p.merchant_id
    AND l.created_at = p.created_at
);

-- Step 2: Rename the products table to mark as deprecated
ALTER TABLE IF EXISTS public.products RENAME TO products_deprecated;

-- Step 3: Create a view for backwards compatibility (read-only)
CREATE OR REPLACE VIEW public.products AS
SELECT 
  l.id,
  l.store_id as merchant_id,
  l.title as name,
  l.description,
  l.base_price as price,
  null::integer as sale_price,
  l.media_urls as images,
  l.category,
  l.module_type::text as product_type,
  CASE 
    WHEN l.module_type = 'sale' THEN COALESCE((l.metadata->>'stock_level')::int, 0)
    ELSE 0
  END as stock_quantity,
  l.is_active,
  COALESCE(l.metadata->'variants', '[]'::jsonb) as variants,
  null::timestamptz as timer_start,
  null::timestamptz as timer_end,
  l.created_at,
  l.updated_at
FROM public.listings l;

-- Step 4: Add comment to deprecated table
COMMENT ON TABLE public.products_deprecated IS 'DEPRECATED: Use public.listings table instead. This table is kept for data backup only.';

-- Step 5: Update the storage bucket to use 'listings' path as well
-- (The storage bucket 'products' remains for backwards compatibility with existing images)
