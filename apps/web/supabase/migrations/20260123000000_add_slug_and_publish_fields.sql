-- Migration: Add slug and publishing fields to storefronts
-- DATE: 2026-01-23

-- 1. Add Slug and Published At columns
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb; -- For store-wide settings like logo, nav, etc.

-- 2. Ensure Slug is Unique
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'storefronts_slug_key') THEN
        ALTER TABLE public.storefronts ADD CONSTRAINT storefronts_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 3. Update Function to set published_at
CREATE OR REPLACE FUNCTION public.handle_storefront_publish()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_published = true AND OLD.is_published = false THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_storefront_publish ON public.storefronts;
CREATE TRIGGER on_storefront_publish
    BEFORE UPDATE ON public.storefronts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_storefront_publish();
