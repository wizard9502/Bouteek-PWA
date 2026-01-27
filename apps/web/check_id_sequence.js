const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Inspecting merchants.id default value...');

    // We cannot easily query information_schema via JS client directly for defaults unless we use rpc.
    // But we can try to Insert a dummy row with NO ID.

    const dummyUser = '00000000-0000-0000-0000-000000000000'; // Assume foreign key checking might fail first?
    // Actually, we need a valid User ID to pass FK constraint if we want to test ID default.
    // Let's use an existing user if we can list one.

    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (!users || users.length === 0) {
        console.log('No users to test FK.');
        return;
    }
    const userId = users[0].id; // Use real user ID

    console.log(`Testing Insert into merchants with existing User ID: ${userId}`);

    const { data, error } = await supabase.from('merchants').insert({
        user_id: userId,
        business_name: 'Sequence Test',
        email: 'seq@test.com',
        subscription_tier: 'STARTER',
        // NO ID PROVIDED
    }).select();

    if (error) {
        console.log('Insert FAILED:', error);
        if (error.message.includes('null value in column "id"')) {
            console.log('>>> CONFIRMED: merchants.id HAS NO DEFAULT VALUE (Not Serial).');
        }
    } else {
        console.log('Insert SUCCESS. ID generated:', data[0].id);
        // Clean up
        await supabase.from('merchants').delete().eq('id', data[0].id);
    }
}

run();
