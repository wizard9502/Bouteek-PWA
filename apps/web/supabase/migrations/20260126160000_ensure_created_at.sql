-- Ensure merchants has created_at
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
