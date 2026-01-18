-- Add preferred_theme column to merchants table
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS preferred_theme text DEFAULT 'light';
