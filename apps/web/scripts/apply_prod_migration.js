const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Credentials provided by user
const connectionString = 'postgres://postgres:yF9XEbWu0ExB0RpL@db.gkrfphdrxthssxrxgdlr.supabase.co:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function run() {
    console.log('Connecting to database...');
    try {
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260119000003_production_schema.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration...');
        // postgres.js can execute file content directly
        await sql.unsafe(migrationSql);
        console.log('Migration applied successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await sql.end();
    }
}

run();
