-- Fix Schema Drift for 'merchants' table
-- The table has CamelCase columns, but the Trigger expects snake_case.
-- This script normalizes the schema.

-- 1. Rename 'userId' to 'user_id' (Critical for Trigger)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='userId') THEN
    ALTER TABLE public.merchants RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;

-- 2. Rename 'isVerified' to 'is_verified'
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='isVerified') THEN
    ALTER TABLE public.merchants RENAME COLUMN "isVerified" TO is_verified;
  END IF;
END $$;

-- 3. Cleanup Duplicate 'businessName' (if 'business_name' also exists)
DO $$
BEGIN
  -- If both exist, drop the CamelCase one (Assuming table is empty or migration desired)
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='businessName') 
     AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='business_name') THEN
    ALTER TABLE public.merchants DROP COLUMN "businessName";
  END IF;
  
  -- If ONLY 'businessName' exists, rename it
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='businessName') 
     AND NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='business_name') THEN
    ALTER TABLE public.merchants RENAME COLUMN "businessName" TO business_name;
  END IF;
END $$;

-- 4. Cleanup Duplicate 'subscriptionTier'
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='subscriptionTier') 
     AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='subscription_tier') THEN
    ALTER TABLE public.merchants DROP COLUMN "subscriptionTier";
  END IF;

  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='subscriptionTier') 
     AND NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='subscription_tier') THEN
    ALTER TABLE public.merchants RENAME COLUMN "subscriptionTier" TO subscription_tier;
  END IF;
END $$;

-- 5. Add 'is_banned' if missing (both cases missing)
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='merchants' AND column_name='is_banned') THEN
    ALTER TABLE public.merchants ADD COLUMN is_banned boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- 6. Ensure 'user_id' has Foreign Key
-- (Usually preserved during rename, but good to check if needed)
