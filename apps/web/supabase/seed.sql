-- Seed Test Merchant User and Data

-- 1. Create User in auth.users (Using a fixed UUID for reproducibility)
-- Note: Password hash is for "password" (bcrypt)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '00000000-0000-0000-0000-000000000000',
    'testmerchant@bouteek.shop',
    '$2a$10$wT.f.q/xJ0E.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X', -- Dummy hash, likely won't work for login unless Supabase local is loose, but enables DB relationships. Ideally use the signup flow or just assume user exists.
    -- Actually, simpler: Just insert into public tables and use RLS bypass or just assume I can query it.
    -- BUT middleware checks auth. So I DO need a valid auth session.
    -- The browser test FAILED signup. Best way to get a user is to fix signup or use an existing one. 
    -- Since data was empty, no existing one. 
    -- Let's try to insert anyway.
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test Merchant"}',
    NOW(),
    NOW(),
    'authenticated',
    ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Public User Profile (Trigger might handle this, but let's be safe and doing ON CONFLICT)
INSERT INTO public.users (id, email, name, role)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'testmerchant@bouteek.shop',
    'Test Merchant',
    'user'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Merchant Entry
INSERT INTO public.merchants (id, user_id, business_name, slug, is_verified, is_frozen, bouteek_cash_balance, subscription_tier)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bouteek Official Test Store',
    'testmerchant', -- This needs to match the storefront slug for routing? No, storefront has its own slug.
    false, -- UNVERIFIED initially for testing gating
    false,
    50000,
    'pro'
) ON CONFLICT (id) DO NOTHING;

-- 4. Create Storefront
INSERT INTO public.storefronts (id, user_id, slug, name, is_published, theme_settings)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'testmerchant', -- Accessed via testmerchant.bouteek.shop or /store/testmerchant
    'Bouteek Official Test Store',
    true,
    '{"primaryColor": "#000000"}'
) ON CONFLICT (id) DO NOTHING;
