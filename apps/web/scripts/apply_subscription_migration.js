const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Parse Project ID from Supabase URL
// URL format: https://<project_ref>.supabase.co
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];

if (!projectRef) {
    console.error("Could not parse Project Reference from NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
}

// Construct DB Connection String
// Use the password we saw earlier: yF9XEbWu0ExB0RpL
// Host: db.<project_ref>.supabase.co
const connectionString = `postgres://postgres:yF9XEbWu0ExB0RpL@db.${projectRef}.supabase.co:5432/postgres`;

console.log(`Connecting to database at db.${projectRef}.supabase.co...`);

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function run() {
    try {
        const filesToRun = [
            '../supabase/migrations/20260119000005_subscription_rpc.sql',
            '../supabase/migrations/20260119000006_fix_schema.sql',
            '../supabase/migrations/20260119000007_place_order_rpc.sql'
        ];

        for (const file of filesToRun) {
            const migrationPath = path.join(__dirname, file);
            if (fs.existsSync(migrationPath)) {
                console.log(`Applying ${file}...`);
                const migrationSql = fs.readFileSync(migrationPath, 'utf8');
                await sql.unsafe(migrationSql);
                console.log(`Checked/Applied ${file}`);
            } else {
                console.warn(`File not found: ${file}`);
            }
        }

        console.log('All schema fixes applied successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await sql.end();
    }
}

run();
