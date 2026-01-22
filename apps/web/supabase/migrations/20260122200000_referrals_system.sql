-- Migration: Add referrals system
-- This migration creates the referrals table and adds referral_code to merchants

-- Add referral_code column to merchants if not exists
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'BTK-';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code for new merchants
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_referral_code ON merchants;
CREATE TRIGGER trg_auto_referral_code
    BEFORE INSERT ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- Generate codes for existing merchants without one
UPDATE merchants 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'paid')),
    commission_amount NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    UNIQUE(referred_user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
DROP POLICY IF EXISTS "Merchants can view their own referrals" ON referrals;
CREATE POLICY "Merchants can view their own referrals"
    ON referrals FOR SELECT
    USING (
        referrer_id IN (
            SELECT id FROM merchants WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all referrals" ON referrals;
CREATE POLICY "Admins can manage all referrals"
    ON referrals FOR ALL
    USING (public.is_admin());

-- Ensure users table has is_banned column
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create view for user management (admin only)
CREATE OR REPLACE VIEW public.users AS
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'role', 'customer') as role,
    COALESCE((raw_user_meta_data->>'is_banned')::boolean, false) as is_banned,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users;

-- RLS on users view is handled by Supabase access

-- Grant access
GRANT SELECT ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
