const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking for layout_config column in storefronts...');

    // Try to select the specific column
    const { data, error } = await supabase
        .from('storefronts')
        .select('layout_config')
        .limit(1);

    if (error) {
        console.error('Schema Check Failed:', error);
        if (error.code === 'PGRST204' || error.message.includes('column') || error.message.includes('does not exist')) {
            console.log('CONFIRMED: Column layout_config DOES NOT EXIST.');
        }
    } else {
        console.log('Schema Check Passed: layout_config exists.');
    }

    // Also check debug_logs access just in case
    const { error: logError } = await supabase.from('debug_logs').select('id').limit(1);
    if (logError) console.log('Debug Logs Access Error:', logError);
    else console.log('Debug Logs Access OK');
}

run();
