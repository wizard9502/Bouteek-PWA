
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLogic() {
    console.log('🧪 Starting Logic Verification Engine...\n');

    let merchantId;
    let listingId;
    let orderId;

    try {
        // Setup: Get Test Merchant
        const { data: merchantData } = await supabase
            .from('merchants')
            .select('id, bouteek_cash_balance')
            .eq('email', 'test@bouteek.shop')
            .single();

        if (merchantData) {
            merchantId = merchantData.id;
            console.log(`✅ Found Merchant: ${merchantId}`);
            console.log(`   Current Balance: ${merchantData.bouteek_cash_balance}`);
        } else {
            console.error('❌ Test Merchant not found. Run seed.ts first.');
            return;
        }

        // Test 1: Sale Logic (Inventory Deduction)
        console.log('\n--- Test 1: Sale Inventory Logic ---');
        // Find a product
        const { data: product } = await supabase.from('listings').select('*').eq('module_type', 'sale').eq('merchant_id', merchantId).limit(1).single();
        if (product) {
            console.log(`   Product: ${product.title}, Stock: ${product.stock_quantity}`);
            // Simulate Order
            const { data: order } = await supabase.from('orders').insert({
                merchant_id: merchantId,
                listing_id: product.id,
                total: product.price,
                status: 'paid', // Should trigger logic? Wait, logic usually triggers on status change or direct decrease
                customer_name: 'Logic Tester',
                customer_phone: '123'
            }).select().single();

            // Check stock again
            const { data: productAfter } = await supabase.from('listings').select('stock_quantity').eq('id', product.id).single();
            if (productAfter && productAfter.stock_quantity < (product.stock_quantity || 0)) {
                console.log(`✅ Inventory Deducted: ${product.stock_quantity} -> ${productAfter.stock_quantity}`);
            } else {
                console.log(`⚠️ Inventory DID NOT deduct automatically. (Logic might be in Application Layer or Trigger missing?)`);
                // Note: If triggers are missing for stock, this highlights a gap.
                // We will check 'on_order_paid' trigger in commission logic - does it handle inventory too?
            }
        } else {
            console.log('⚠️ No Sale listing found to test inventory.');
        }


        // Test 2: Wallet Commission Logic
        console.log('\n--- Test 2: Wallet Commission Logic ---');
        // We created a PAID order above. Let's see if commission was deducted.
        const { data: merchantAfter } = await supabase.from('merchants').select('bouteek_cash_balance').eq('id', merchantId).single();

        const beforeObj = merchantData.bouteek_cash_balance || 0;
        const afterObj = merchantAfter?.bouteek_cash_balance || 0;

        if (afterObj < beforeObj) {
            console.log(`✅ Commission Auto-Deducted: ${beforeObj} -> ${afterObj}`);
            console.log(`   Logic: on_order_paid trigger IS WORKING.`);
        } else {
            console.log(`❌ Commission NOT Deducted. Check triggers.`);
            // Debug
            const { data: triggers } = await supabase.rpc('get_triggers'); // Imaginary rpc, hard to debug from here without checking migrations.
        }

        // Test 3: Rental Date Conflict (Simulation)
        console.log('\n--- Test 3: Rental Logic ---');
        const { data: rental } = await supabase.from('listings').select('*').eq('module_type', 'rental').eq('merchant_id', merchantId).limit(1).single();
        if (rental) {
            // Create a blocking reservation
            const startDate = new Date().toISOString();
            const endDate = new Date(Date.now() + 86400000).toISOString();

            // Check custom availability function if exposed as RPC, or simulated via DB constraints?
            // The system uses 'InventoryService' application logic usually.
            // But we can check if inserting an Overlapping "booking" (order metadata?) is blocked?
            // Likely enforced by application, not DB constraint unless specific table exists.
            // We'll skip deep constraint check here as it's application layer usually.
            console.log(`   Rental Listing Found. Verification of dates requires 'InventoryService' checks.`);
        }

    } catch (e) {
        console.error(e);
    }
}

verifyLogic();
