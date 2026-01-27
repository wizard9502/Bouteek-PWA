const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    const dummyUserId = '697f6279-00b5-4344-b607-f796356d1721';

    console.log('Using User ID:', dummyUserId);

    // Try minimal insert first
    const { data: merchant, error: merchantError } = await supabase.from('merchants').upsert({
        user_id: dummyUserId,
        business_name: 'Le Chic Boutique',
        slug: 'lechic'
    }, { onConflict: 'user_id' }).select();

    if (merchantError) {
        console.error('Error creating merchant:', merchantError);
        return;
    }

    const m = merchant[0];
    console.log('Merchant created:', m.id);

    // Now try to update with more data
    const { error: updateError } = await supabase.from('merchants').update({
        description: 'Boutique de mode haut de gamme à Dakar.',
        bouteek_cash_balance: 1250500,
        subscription_tier: 'pro'
    }).eq('id', m.id);

    if (updateError) {
        console.warn('Update failed (some columns might be missing):', updateError.message);
    }

    // Seed listings
    const listings = [
        { title: 'Robe d\'été Fleurie', base_price: 25000, module_type: 'sale', category: 'Mode' },
        { title: 'Sac à main en cuir', base_price: 45000, module_type: 'sale', category: 'Accessoires' }
    ];

    for (const l of listings) {
        const { error: lError } = await supabase.from('listings').insert({ ...l, store_id: m.id, is_active: true });
        if (lError) console.error('Listing error:', lError);
    }

    console.log('Seed process finished.');
}

seed();
