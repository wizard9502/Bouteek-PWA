const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Listing users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error || !users || users.length === 0) {
        console.log('No users found or error listing users:', error);
        return;
    }

    const user = users[0];
    console.log(`Using User ID: ${user.id}`);

    // 1. Check/Insert public.users
    const { data: profiles, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

    if (!profiles || profiles.length === 0) {
        console.log('User profile missing. Attempting Insert...');
        const { error: insertUserError } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: 'Test User',
            role: 'user'
        });
        if (insertUserError) {
            console.error('FAILED: Insert into public.users:', insertUserError);
            return;
        }
        console.log('SUCCESS: Inserted into public.users');
    } else {
        console.log('User profile exists.');
    }

    // 2. Insert public.merchants
    const merchantId = crypto.randomUUID();
    const slug = `test-merchant-${Date.now()}`;
    console.log(`Attempting Insert into public.merchants (Slug: ${slug})...`);

    const { error: merchantError } = await supabase.from('merchants').insert({
        id: merchantId,
        user_id: user.id,
        business_name: 'Test Business',
        email: user.email,
        slug: slug,
        subscription_tier: 'STARTER'
    });

    if (merchantError) {
        console.error('FAILED: Insert into public.merchants:', merchantError);
        return;
    }
    console.log('SUCCESS: Inserted into public.merchants');

    // 3. Insert public.storefronts
    console.log('Attempting Insert into public.storefronts...');
    const { error: storeError } = await supabase.from('storefronts').insert({
        merchant_id: merchantId,
        name: 'Test Store',
        slug: `store-${slug}`,
        layout_config: [],
        layout_blocks: [],
        custom_domain_status: 'pending'
    });

    if (storeError) {
        console.error('FAILED: Insert into public.storefronts:', storeError);
    } else {
        console.log('SUCCESS: Inserted into public.storefronts');
    }
}

run();
