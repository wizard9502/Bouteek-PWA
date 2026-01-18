-- Add referred_by_code to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by_code text;

-- Update the handle_new_user function to include referral code from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, referred_by_code)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referral_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
