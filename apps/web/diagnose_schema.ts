
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkSchema() {
    console.log("Checking wallet_transactions schema...");
    const { data: walletData, error: walletError } = await supabase.from('wallet_transactions').select('*').limit(1);
    if (walletError) console.error("Wallet Error:", walletError);
    else console.log("Wallet Columns:", Object.keys(walletData[0] || {}));

    console.log("\nChecking orders schema...");
    const { data: orderData, error: orderError } = await supabase.from('orders').select('*').limit(1);
    if (orderError) console.error("Orders Error:", orderError);
    else console.log("Orders Columns:", Object.keys(orderData[0] || {}));

    console.log("\nChecking merchants relationship...");
    const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*, users(email)')
        .limit(1);
    if (merchantError) {
        console.error("Merchants JOIN Error:", merchantError);
        console.log("Retrying with users:user_id(email)...");
        const { error: retryError } = await supabase
            .from('merchants')
            .select('*, users:user_id(email)')
            .limit(1);
        if (retryError) console.error("Merchants Retry JOIN Error:", retryError);
        else console.log("JOIN works with users:user_id(email)");
    } else {
        console.log("JOIN works with users(email)");
    }
}

checkSchema();
