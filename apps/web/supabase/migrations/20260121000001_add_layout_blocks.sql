-- Migration: Add layout_blocks JSONB column to storefronts table
-- This replaces the old template-based system with a block-based layout engine

ALTER TABLE storefronts 
ADD COLUMN IF NOT EXISTS layout_blocks JSONB DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN storefronts.layout_blocks IS 'Array of block objects defining the storefront layout. Each block has: id, type, enabled, settings.';
