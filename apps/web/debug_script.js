const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
// Service Role Key provided by User
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    const email = `service_debug_${Date.now()}@bouteek.shop`;
    const password = 'password123';

    console.log(`[Service] Creating User ${email}...`);

    // backend-side user creation avoids some client-side RLS issues but executes triggers
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: 'Service Role User' },
        email_confirm: true
    });

    if (error) {
        console.error('[Service] CreateUser Error:', error);
    } else {
        console.log('[Service] User Created Successfully:', data.user.id);
    }

    // Wait for triggers to potentially fail async or log
    await new Promise(r => setTimeout(r, 2000));

    console.log('[Service] Fetching Debug Logs...');
    const { data: logs, error: logError } = await supabase
        .from('debug_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

    if (logError) {
        console.error('Log Fetch Error:', logError);
    } else {
        console.log('Logs:', JSON.stringify(logs, null, 2));
    }
}

run();
