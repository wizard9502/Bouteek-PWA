const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    if (error) {
        console.error('Error:', error);
        // Try another way: RPC
        const { data: d2, error: e2 } = await supabase.rpc('get_tables'); // If it exists
        console.error('RPC Error:', e2);
    } else {
        console.log('Tables:', data.map(t => t.table_name));
    }
}

check();
