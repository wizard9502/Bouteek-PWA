
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Ideally use service role key for backend scripts, but anon might work if RLS allows or if we just user it as a user.

// Actually, we usually need SERVICE_ROLE_KEY to bypass RLS for seeding if policies are strict.
// But let's try with what we have access to or instruct usage of service key.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
    console.log('🌱 Seeding data...');

    // 1. Merchant
    const merchantId = 999;
    const { error: merchantError } = await supabase
        .from('merchants')
        .upsert({
            id: merchantId,
            name: 'Test Merchant',
            email: 'test@bouteek.shop',
            subscription_tier: 'starter'
        })
        .select();

    if (merchantError) console.warn('Merchant upsert warning:', merchantError.message);
    else console.log('✅ Merchant seeded');

    // 2. Storefront
    const { error: storeError } = await supabase
        .from('storefronts')
        .upsert({
            merchant_id: merchantId,
            name: 'Test Store',
            slug: 'test-store',
            custom_domain_status: 'verified'
        }, { onConflict: 'slug' })
        .select();

    if (storeError) console.warn('Storefront upsert warning:', storeError.message);
    else console.log('✅ Storefront seeded');

    // 3. Rental Listing
    const { error: rentalError } = await supabase
        .from('listings')
        .upsert({
            merchant_id: merchantId,
            title: 'Luxury Beach House',
            description: 'Beautiful beach house for weekend getaways.',
            price: 50000,
            base_price: 50000,
            currency: 'XOF',
            image_urls: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'],
            module_type: 'rental',
            metadata: {
                rental_unit: 'night',
                deposit_amount: 25000,
                require_id_verification: true
            }
        }, { onConflict: 'id' }) // ID isn't fixed here so this might just insert duplicates if run multiple times without ID. Ideally we'd valid ID.
    // For simplicity in this script, we'll let it auto-generate ID, but this means re-running creates dupes. 
    // Let's check if it exists first to avoid spamming.

    // Refined approach: Delete existing test listings for this merchant to keep clean?
    // Or just insert if empty.

    // Let's just create one if not exists.
    const { data: existingListings } = await supabase.from('listings').select('id').eq('merchant_id', merchantId);

    if (!existingListings || existingListings.length === 0) {
        await supabase.from('listings').insert([
            {
                merchant_id: merchantId,
                title: 'Luxury Beach House',
                description: 'Beautiful beach house for weekend getaways.',
                price: 50000,
                base_price: 50000,
                currency: 'XOF',
                image_urls: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2'],
                module_type: 'rental',
                stock_quantity: 1, // Ensure it shows as available
                metadata: {
                    rental_unit: 'night',
                    deposit_amount: 25000,
                    require_id_verification: true
                }
            },
            {
                merchant_id: merchantId,
                title: 'Spa Treatment',
                description: 'Relaxing full body massage.',
                price: 15000,
                base_price: 15000,
                currency: 'XOF',
                image_urls: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874'],
                module_type: 'service',
                stock_quantity: 100,
                metadata: {
                    duration_minutes: 60,
                    allow_specialist_selection: true
                }
            }
        ]);
        console.log('✅ Listings seeded');
    } else {
        console.log('ℹ️ Listings already exist for test merchant');
    }

    console.log('✨ Seeding complete!');
    console.log('👉 You can now visit: http://localhost:3000/store/test-store');
}

seedData().catch(console.error);
