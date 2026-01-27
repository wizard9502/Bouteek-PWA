const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking merchants.user_id type...');

    // Try querying with UUID
    const uuid = '00000000-0000-0000-0000-000000000000';
    const { error: uuidError } = await supabase.from('merchants').select('user_id').eq('user_id', uuid).limit(1);

    if (uuidError && uuidError.message.includes('invalid input syntax for type integer')) {
        console.log('>>> CONFIRMED: merchants.user_id is INTEGER (WRONG TYPE).');
    } else if (!uuidError) {
        console.log('merchants.user_id accepts UUID.');
    } else {
        console.log('UUID Query Error:', uuidError.message);
    }
}

run();
