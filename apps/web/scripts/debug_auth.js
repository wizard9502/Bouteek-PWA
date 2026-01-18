
const { createClient } = require('@supabase/supabase-js');

// Use loading env vars from .env.local if possible, but for script simplicity hardcode or read process
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDAwMjYsImV4cCI6MjA4MjU3NjAyNn0.Xs0wyuM-h-ZBBGIZxhsJX0hXMC2RxUXfksqM5VJoD-g';

// Admin key for inspecting data if needed
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function debugAuth() {
    console.log('--- Debugging Supabase Auth ---');
    const email = `test.debug.${Date.now()}@bouteek.shop`;
    const password = 'Password123!';

    console.log(`Attempting to sign up: ${email}`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Debug User'
                }
            }
        });

        if (error) {
            console.error('❌ SignUp Failed!');
            console.error('Error Message:', error.message);
            console.error('Error Status:', error.status);
            console.error('Full Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ SignUp Success!');
            console.log('User ID:', data.user?.id);

            // Check public.users
            console.log('Checking public.users table...');
            const { data: profile, error: profileError } = await adminSupabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('❌ Profile lookup failed (Trigger might have failed silently?)');
                console.error(profileError);
            } else if (!profile) {
                console.error('❌ Profile missing in public.users!');
            } else {
                console.log('✅ Profile found in public.users:', profile);
            }
        }
    } catch (err) {
        console.error('Unexpected Exception:', err);
    }
}

debugAuth();
