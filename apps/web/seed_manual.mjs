import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
    console.log("🌱 Starting Manual Seed (Attempt 3)...");

    const email = 'testmerchant@bouteek.shop';
    const password = 'password123';
    let userId;

    console.log("Checking for existing user...");
    const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) console.error("List users failed:", listError);

    const existing = listUsers?.users?.find(u => u.email === email);

    if (existing) {
        console.log("User found:", existing.id);
        userId = existing.id;
    } else {
        console.log("Creating new user...");
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Test Merchant' }
        });

        if (createError) console.error("Create user failed:", createError);
        if (newUser?.user) {
            userId = newUser.user.id;
            console.log("Created user:", userId);
        }
    }

    if (!userId) {
        console.error("❌ Aborting: No User ID");
        userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        console.log("Using fallback UUID:", userId);
    }

    // 2. Public Profile
    console.log("Upserting Public Profile...");
    await supabase.from('users').upsert({
        id: userId,
        email: email,
        name: 'Test Merchant',
        role: 'user'
    });

    // 3. Merchant (TRYING 'name' instead of 'business_name')
    console.log("Upserting Merchant...");
    const { data: merchant, error: merchantError } = await supabase.from('merchants').upsert({
        user_id: userId,
        name: 'Bouteek Official Test Store', // SCHEMA ADAPTATION
        slug: 'testmerchant',
        is_verified: false,
        is_frozen: false,
        subscription_tier: 'pro'
    }, { onConflict: 'slug' }).select().single();

    if (merchantError) {
        console.error("Merchant upsert error:", merchantError);
        // Fallback check
        const { data: existingMerch } = await supabase.from('merchants').select('id').eq('slug', 'testmerchant').single();
        if (existingMerch) {
            console.log("Found existing merchant by slug:", existingMerch.id);

            // 4. Storefront
            await supabase.from('storefronts').upsert({
                user_id: userId,
                slug: 'testmerchant',
                name: 'Bouteek Official Test Store',
                is_published: true,
                theme_settings: { primaryColor: '#000000' }
            }, { onConflict: 'slug' });

            // 5. KYC (Rejected)
            await supabase.from('kyc_submissions').delete().eq('merchant_id', existingMerch.id);
            await supabase.from('kyc_submissions').insert({
                merchant_id: existingMerch.id,
                id_type: 'passport',
                id_document_front_url: 'https://placehold.co/600x400',
                selfie_url: 'https://placehold.co/400x400',
                status: 'rejected',
                admin_notes: 'Selfie is blurry. Please retake.'
            });
            console.log("✅ Seed Complete (Recovered).");
            return;
        }
    }

    if (merchant) {
        console.log("Merchant ID:", merchant.id);
        // 4. Storefront
        await supabase.from('storefronts').upsert({
            user_id: userId,
            slug: 'testmerchant',
            name: 'Bouteek Official Test Store',
            is_published: true,
            theme_settings: { primaryColor: '#000000' }
        }, { onConflict: 'slug' });

        // 5. KYC (Rejected)
        await supabase.from('kyc_submissions').delete().eq('merchant_id', merchant.id);
        const { error: kycError } = await supabase.from('kyc_submissions').insert({
            merchant_id: merchant.id,
            id_type: 'passport',
            id_document_front_url: 'https://placehold.co/600x400',
            selfie_url: 'https://placehold.co/400x400',
            status: 'rejected',
            admin_notes: 'Selfie is blurry. Please retake.'
        });
        if (kycError) console.error("KYC error:", kycError);
        else console.log("✅ Seed Complete.");
    }
}

seed().catch(console.error);
