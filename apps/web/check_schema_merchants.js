const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Inspecting merchants table columns...');

    // Select * to see keys
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting merchants:', error);
    } else if (data && data.length > 0) {
        console.log('Merchant Row Keys:', Object.keys(data[0]));
    } else {
        // If table empty, insert a dummy to check keys? 
        // Or select specific columns and check error?
        console.log('No rows in merchants. Checking specific columns...');

        // Check user_id vs userId
        const { error: errorSnake } = await supabase.from('merchants').select('user_id').limit(1);
        if (errorSnake) console.log('Check user_id: FAILED (' + errorSnake.message + ')');
        else console.log('Check user_id: EXISTS');

        const { error: errorCamel } = await supabase.from('merchants').select('userId').limit(1);
        if (errorCamel) console.log('Check userId: FAILED (' + errorCamel.message + ')');
        else console.log('Check userId: EXISTS');
    }
}

run();
