const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const dummyUserId = '9b4a0bd2-f3d6-44d6-873a-5e309075f316';

  const merchantData = {
    user_id: dummyUserId,
    business_name: 'Le Chic Boutique',
    slug: 'lechic-' + Math.floor(Math.random() * 1000),
    bouteek_cash_balance: 1250500
  };

  const { data: merchant, error: merchantError } = await supabase.from('merchants').upsert(merchantData, { onConflict: 'user_id' }).select().single();

  if (merchantError) {
    console.error('Error creating merchant:', merchantError);
    return;
  }

  console.log('Merchant created:', merchant.id);
  console.log('Merchant columns:', Object.keys(merchant));

  // Listings
  const listings = [
    { title: 'Robe d\'été Fleurie', base_price: 25000, module_type: 'sale', category: 'Mode' },
    { title: 'Sac à main en cuir', base_price: 45000, module_type: 'sale', category: 'Accessoires' },
    { title: 'Appartement Plateau', base_price: 75000, module_type: 'rental', category: 'Immobilier' },
    { title: 'Massage Relaxant', base_price: 15000, module_type: 'service', category: 'Bien-être' }
  ];

  for (const l of listings) {
    await supabase.from('listings').insert({ ...l, store_id: merchant.id, is_active: true });
  }

  // Orders
  for (let i = 0; i < 20; i++) {
    const status = i < 2 ? 'pending' : 'completed';
    const total = 15000 + Math.floor(Math.random() * 50000);
    await supabase.from('orders').insert({
        order_number: `ORD-${Date.now()}-${i}`,
        merchant_id: merchant.id,
        customer_name: `Client ${i}`,
        items: [{name: 'Article', price: total, quantity: 1}],
        subtotal: total,
        total: total,
        status: status,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  console.log('Seed done!');
}

seed();
