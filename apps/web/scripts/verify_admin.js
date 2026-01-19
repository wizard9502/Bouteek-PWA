
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdmin() {
    const email = 'mhdcrypt95@gmail.com';
    const password = 'password123'; // Temporary password
    console.log(`Verifying admin access for ${email}...`);

    // 1. Get user from auth.users (requires service role)
    let { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    let user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found in auth system. Creating user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        user = newUser.user;
        console.log(`Created user ${email} with ID: ${user.id}`);
    } else {
        console.log(`Found user ${email} with ID: ${user.id}`);
    }

    // 2. Check public.users table (or wherever role is stored)
    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // 3. Update role to 'admin'
    const updateData = {};
    let currentRole = 'none';

    if (publicUser) {
        console.log('Public user profile found:', publicUser);
        // Check for role column
        if (publicUser.hasOwnProperty('role')) {
            currentRole = publicUser.role;
            if (publicUser.role !== 'admin') {
                updateData.role = 'admin';
            }
        } else if (publicUser.hasOwnProperty('is_admin')) {
            currentRole = publicUser.is_admin ? 'admin' : 'user';
            if (!publicUser.is_admin) {
                updateData.is_admin = true;
            }
        }
    } else {
        console.log("No public profile found (it might be created by trigger properly now, or we need to create it).");
        // If we just created the user, maybe the trigger hasn't run or failed?
        // Or maybe there is no trigger.

        // Let's try to insert directly if we can't find it.
        console.log("Attempting to insert public profile...");
        const { error: insertError } = await supabase
            .from('users')
            .insert({ id: user.id, email: email, role: 'admin', full_name: 'Admin User' });

        if (insertError) {
            console.error("Insert failed (maybe trigger created it in background?):", insertError);
            // If duplicate key error, it means it exists now.
        } else {
            console.log("Created public profile.");
            return; // Done
        }
    }

    if (Object.keys(updateData).length > 0) {
        console.log(`Updating user role from ${currentRole} to admin...`);
        const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating user role:', updateError);
        } else {
            console.log('Successfully updated user role to admin.');
        }
    } else {
        if (publicUser) {
            console.log('User already has admin role.');
        }
    }
}

verifyAdmin();
