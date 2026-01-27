-- Fix Schema Drift for 'storefronts' table (Part 2)
-- The table has CamelCase columns and MISSING 'merchant_id'.

-- 1. Rename 'userId' to 'user_id'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='userId') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;

-- 2. Add 'merchant_id' (Critical for Trigger)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='merchant_id') THEN
    ALTER TABLE public.storefronts ADD COLUMN merchant_id uuid REFERENCES public.merchants(id);
  END IF;
END $$;

-- 3. Rename 'isPublished' to 'is_published'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='isPublished') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "isPublished" TO is_published;
  END IF;
END $$;

-- 4. Rename 'createdAt' to 'created_at'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='createdAt') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "createdAt" TO created_at;
  END IF;
END $$;

-- 5. Rename 'updatedAt' to 'updated_at'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='updatedAt') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;

-- 6. Rename 'themeSettings' to 'theme_settings'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='storefronts' AND column_name='themeSettings') THEN
    ALTER TABLE public.storefronts RENAME COLUMN "themeSettings" TO theme_settings;
  END IF;
END $$;

-- 7. Ensure layout_config and layout_blocks exist (already confirmed, but good practice)
