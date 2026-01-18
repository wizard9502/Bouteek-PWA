-- Migration to set the specific user as admin
-- This will update the user's role in the public.users table

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'mhdcrypt95@gmail.com';

-- Also ensure any future login with this email gets the role if it's recreated
-- (Optional, but good for persistence)

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'mhdcrypt95@gmail.com') THEN
        UPDATE public.users SET role = 'admin' WHERE email = 'mhdcrypt95@gmail.com';
    END IF;
END $$;
