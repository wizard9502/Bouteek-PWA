const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking listings.store_id type...');

    // Try querying with UUID
    const uuid = '00000000-0000-0000-0000-000000000000';
    const { error: uuidError } = await supabase.from('listings').select('store_id').eq('store_id', uuid).limit(1);

    if (uuidError && uuidError.message.includes('invalid input syntax for type integer')) {
        console.log('>>> listings.store_id is INTEGER.');
    } else if (!uuidError || uuidError.code === 'PGRST116') {
        console.log('listings.store_id accepts UUID (So it is UUID).');
        // If it accepts UUID but merchants.id is Integer, we have a mismatch.

        // Let's check if we can query with Integer
        const { error: intError } = await supabase.from('listings').select('store_id').eq('store_id', 123).limit(1);
        if (!intError) {
            console.log('listings.store_id ALSO accepts Integer? (Maybe Text/Varchar?)');
        } else {
            console.log('listings.store_id REJECTS Integer (' + intError.message + ')');
        }
    } else {
        console.log('Error checking listings:', uuidError.message);
        if (uuidError.message.includes('relation "public.listings" does not exist')) {
            console.log('Table listings does not exist.');
        }
    }
}

run();
