const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Inspecting storefronts table columns...');

    // Select * to see keys. If empty, we can't see keys this way easily without valid insert.
    // Actually, we can check pg_catalog via rpc if available, but we can't content.
    // We can try to insert a dummy with NO columns?

    const { data, error } = await supabase.from('storefronts').select('*').limit(1);

    if (data && data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
    } else {
        console.log('Table empty. Trying brute force common names...');
        const candidates = ['merchant', 'merchant_id', 'merchantId', 'business_id', 'businessId', 'store_id'];

        for (const col of candidates) {
            const { error } = await supabase.from('storefronts').select(col).limit(1);
            console.log(`${col}: ${error ? 'MISSING' : 'EXISTS'}`);
        }
    }
}

run();
