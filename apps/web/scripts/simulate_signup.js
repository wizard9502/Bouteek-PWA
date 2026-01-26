
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Must use service role to admin users

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config (Service Role Key required for signup simulation)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateSignup() {
    console.log('🧪 Simulating New User Signup to test "Hallway" Trigger...\n');

    const email = `test.user.${Date.now()}@bouteek.shop`;
    const password = 'password123';

    try {
        // 1. Create User
        console.log(`Creating user: ${email}`);
        const { data: { user }, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Simulated User' }
        });

        if (error) throw error;
        if (!user) throw new Error('User creation failed');

        console.log(`✅ User created: ${user.id}`);

        // 2. Check Merchant Profile
        console.log('Checking for auto-created Merchant profile...');
        // Give trigger a moment - though in same transaction usually immediate
        const { data: merchant } = await supabase.from('merchants').select('*').eq('id', user.id).single();

        if (merchant) {
            console.log(`✅ Merchant Profile Found: ${merchant.name} (${merchant.id})`);
        } else {
            console.error(`❌ Merchant Profile NOT found. Trigger failed?`);
            // Check logs or permissions
        }

        // 3. Check Storefront
        console.log('Checking for auto-created Storefront...');
        const { data: storefront } = await supabase.from('storefronts').select('*').eq('merchant_id', user.id).single();

        if (storefront) {
            console.log(`✅ Storefront Found: ${storefront.name}`);
            console.log(`   Slug: ${storefront.slug}`);
            console.log(`   Layout Config Present: ${!!storefront.layout_config}`);
            if (storefront.layout_config && Array.isArray(storefront.layout_config) && storefront.layout_config.length > 0) {
                console.log(`   ✅ "Lego" Bricks detected: ${storefront.layout_config.length} blocks`);
                console.log(`      First block: ${JSON.stringify(storefront.layout_config[0].type)}`);
            } else {
                console.warn(`   ⚠️ Layout Config missing or empty.`);
            }
        } else {
            console.error(`❌ Storefront NOT found.`);
        }

    } catch (e) {
        console.error('Simulation Failed:', e.message);
    }
}

simulateSignup();
