-- Migration: Store Builder Layout Schema
-- Adds layout and social_links columns to storefronts table

-- Add layout column for schema-driven sections
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS layout JSONB DEFAULT '{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "config": {
        "title": "Welcome to Our Store",
        "subtitle": "Discover amazing products",
        "buttonText": "Shop Now",
        "buttonLink": "/products",
        "backgroundType": "color",
        "backgroundValue": "#000000",
        "overlay": true,
        "overlayOpacity": 0.3
      },
      "visible": true
    },
    {
      "id": "products",
      "type": "listing_grid",
      "config": {
        "module": "sale",
        "columns": 2,
        "limit": 4,
        "showPrices": true,
        "showAddToCart": true,
        "title": "Featured Products"
      },
      "visible": true
    }
  ]
}'::jsonb;

-- Add social_links column for footer social media
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{
  "instagram": "",
  "snapchat": "",
  "tiktok": ""
}'::jsonb;

-- Add module_type to storefronts if not exists
DO $$ BEGIN
  CREATE TYPE public.storefront_module_enum AS ENUM ('sale', 'rental', 'service');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS module_type public.storefront_module_enum DEFAULT 'sale';

-- Create index for faster layout queries
CREATE INDEX IF NOT EXISTS idx_storefronts_layout ON public.storefronts USING gin(layout);
CREATE INDEX IF NOT EXISTS idx_storefronts_social ON public.storefronts USING gin(social_links);

-- Add comment
COMMENT ON COLUMN public.storefronts.layout IS 'Schema-driven layout JSON for store builder sections';
COMMENT ON COLUMN public.storefronts.social_links IS 'Social media links for footer (Instagram, Snapchat, TikTok)';
