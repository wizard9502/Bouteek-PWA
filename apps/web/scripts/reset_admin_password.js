const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetAdminPassword() {
    const email = 'mhdcrypt95@gmail.com';
    const newPassword = 'Admin123!';

    console.log(`Attempting to reset password for ${email}...`);

    try {
        // First, get the user by email
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return;
        }

        const user = users.users.find(u => u.email === email);

        if (!user) {
            console.log(`User ${email} not found. Creating...`);
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: newPassword,
                email_confirm: true
            });

            if (createError) {
                console.error('Error creating user:', createError);
                return;
            }

            console.log('User created:', newUser.user.id);

            // Update the public.users table with admin role
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ role: 'admin' })
                .eq('authId', newUser.user.id);

            if (updateError) {
                console.error('Error updating role:', updateError);
            } else {
                console.log('User role updated to admin');
            }
            return;
        }

        console.log(`Found user: ${user.id}`);

        // Update the password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (error) {
            console.error('Error resetting password:', error);
            return;
        }

        console.log('Password successfully reset!');
        console.log('User:', data.user.email);

        // Verify the user has admin role in public.users
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('authId', user.id)
            .single();

        if (userError) {
            console.log('No entry in public.users for this auth user, creating...');
            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    authId: user.id,
                    email: email,
                    role: 'admin'
                });
            if (insertError) {
                console.error('Error inserting user:', insertError);
            } else {
                console.log('Created user entry with admin role');
            }
        } else {
            console.log('Current role in public.users:', userData.role);
            if (userData.role !== 'admin') {
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({ role: 'admin' })
                    .eq('authId', user.id);
                if (updateError) {
                    console.error('Error updating role:', updateError);
                } else {
                    console.log('Role updated to admin');
                }
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

resetAdminPassword();
