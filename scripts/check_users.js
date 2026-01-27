const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }
    console.log('Found users:', users.length);
    if (users.length > 0) {
        console.log('First user ID:', users[0].id);
        console.log('First user Email:', users[0].email);
    } else {
        // Create one
        const { data: user, error: createError } = await supabase.auth.admin.createUser({
            email: 'merchant@bouteek.shop',
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: 'Jean Dupont' }
        });
        if (createError) {
            console.error('Error creating auth user:', createError);
        } else {
            console.log('Created new auth user:', user.user.id);
        }
    }
}

check();
