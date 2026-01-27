const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'merchants' });
    // If rpc doesn't exist, we can try RAW query if using postgres-js or similar, 
    // but let's try a different way.

    // Try to select just one column that MUST exist.
    const { data: d2, error: e2 } = await supabase.from('merchants').select('*').limit(0);
    if (e2) {
        console.error('Error:', e2);
    } else {
        console.log('Available columns:', d2);
    }
}

check();
