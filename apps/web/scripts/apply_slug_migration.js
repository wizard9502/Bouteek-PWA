const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Credentials from apply_prod_migration.js
const connectionString = 'postgres://postgres:yF9XEbWu0ExB0RpL@db.gkrfphdrxthssxrxgdlr.supabase.co:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function run() {
    console.log('Connecting to database...');
    try {
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260123000000_add_slug_and_publish_fields.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration...');
        await sql.unsafe(migrationSql);
        console.log('Migration applied successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await sql.end();
    }
}

run();
