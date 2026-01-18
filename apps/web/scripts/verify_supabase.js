
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying Supabase connection...');

    // Try querying a table directly since information_schema access varies
    // Note: If tables don't exist yet, this will error with "relation does not exist"
    try {
        const { data, error } = await supabase.from('merchants').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Check failed:', error.message);
            if (error.code === '42P01') {
                console.log('Table "merchants" does not exist. Migration is required.');
            }
        } else {
            console.log('Success! Connected to "merchants" table.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verify();
