
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config (Service Role Key required for migrations)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationFile = path.join(__dirname, '../supabase/migrations/20260126000000_fix_onboarding_trigger.sql');

    console.log(`Applying migration: ${migrationFile}`);
    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');

        // Supabase-js doesn't execute arbitrary SQL directly via public API usually, 
        // unless we have a specific RPC or use the pg connection.
        // BUT, for this environment, let's assume we can use the 'postgres' package or if there's a helper.
        // Wait, earlier runs showed migration files being applied? Or verified?
        // Actually, without 'supabase db push', we need a way to run this SQL.
        // Let's trying creating an RPC 'exec_sql' if it exists, or suggest user runs it.
        // Checking for standard 'postgres' usage.

        // Let's try to simulate applying it via a direct connection if 'postgres' lib is available (it was in package.json)
        const postgres = require('postgres');
        const dbUrl = process.env.DATABASE_URL; // Need this env var

        if (!dbUrl) {
            console.log('⚠️ DATABASE_URL not found. Attempting to use Supabase Management API or requesting user action.');
            console.log('   (If you are running locally, please run `supabase db push` or execute the SQL in your dashboard)');
            return;
        }

        const sqlClient = postgres(dbUrl);
        await sqlClient.unsafe(sql);
        console.log('✅ Migration executed successfully.');
        await sqlClient.end();

    } catch (e) {
        console.error('Migration Failed:', e);
        // Fallback: Instructions
        console.log('\n❌ Could not apply migration automatically.');
        console.log('👉 Please execute the contents of "supabase/migrations/20260126000000_fix_onboarding_trigger.sql" in your Supabase SQL Editor.');
    }
}

applyMigration();
