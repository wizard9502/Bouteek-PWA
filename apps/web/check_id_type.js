const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Inspecting merchants.id type...');

    // We can infer type by trying to filter with a UUID or Int

    // 1. Try selecting with a dummy integer
    const { error: intError } = await supabase.from('merchants').select('id').eq('id', 12345).limit(1);
    if (!intError) {
        console.log('Query with Integer ID: SUCCESS (Likely Integer Type)');
    } else {
        console.log('Query with Integer ID: FAILED (' + intError.message + ')');
    }

    // 2. Try selecting with a dummy UUID
    const uuid = '00000000-0000-0000-0000-000000000000';
    const { error: uuidError } = await supabase.from('merchants').select('id').eq('id', uuid).limit(1);
    if (!uuidError) {
        console.log('Query with UUID: SUCCESS (Likely UUID Type)');
    } else {
        console.log('Query with UUID: FAILED (' + uuidError.message + ')');
    }
}

run();
