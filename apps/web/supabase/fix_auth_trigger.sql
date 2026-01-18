
-- 1. Robustly create the Enum if missing
DO $$ BEGIN
    CREATE TYPE public.role_enum AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure Users table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role public.role_enum default 'user' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Enable RLS (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create/Replace the Trigger Function with SECURITY DEFINER
-- This is the critical fix for "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING; -- Handle idempotency
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Grant Permissions (Fixes "permission denied" errors)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated; -- Allow users to update their own profile
