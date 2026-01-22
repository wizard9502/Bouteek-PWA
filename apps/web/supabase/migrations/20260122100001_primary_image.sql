-- Migration: Primary Image Field
-- Adds primary_image_url column to listings table for main display image

-- Add primary_image_url column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS primary_image_url text;

-- Create function to automatically set primary_image_url from media_urls
CREATE OR REPLACE FUNCTION public.set_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If primary_image_url is null but media_urls has content, use first image
  IF NEW.primary_image_url IS NULL AND 
     NEW.media_urls IS NOT NULL AND 
     jsonb_array_length(NEW.media_urls) > 0 THEN
    NEW.primary_image_url := NEW.media_urls->>0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set primary image
DROP TRIGGER IF EXISTS set_primary_image_trigger ON public.listings;
CREATE TRIGGER set_primary_image_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_primary_image();

-- Backfill existing listings
UPDATE public.listings 
SET primary_image_url = media_urls->>0 
WHERE primary_image_url IS NULL 
  AND media_urls IS NOT NULL 
  AND jsonb_array_length(media_urls) > 0;

-- Add comment
COMMENT ON COLUMN public.listings.primary_image_url IS 'Main display image URL, typically the first image in media_urls';
