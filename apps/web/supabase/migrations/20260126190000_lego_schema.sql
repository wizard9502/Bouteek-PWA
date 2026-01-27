-- Migration: Add Lego Builder Columns to Storefronts

-- 1. Add layout_config (JSONB) for the block array
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '[]'::jsonb;

-- 2. Add global settings (JSONB) for theme/colors if not exists
-- (Some schema versions might have theme_settings, let's ensure we use one consistent column)
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 3. Comment
COMMENT ON COLUMN public.storefronts.layout_config IS 'Array of Lego Bricks (id, type, settings)';
COMMENT ON COLUMN public.storefronts.settings IS 'Global store settings (theme, fonts, integrations)';

-- 4. Audit
-- Ensure RLS allows update by owner (should be covered by existing policies)
