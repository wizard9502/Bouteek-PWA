const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Credentials
const connectionString = 'postgres://postgres:yF9XEbWu0ExB0RpL@db.gkrfphdrxthssxrxgdlr.supabase.co:5432/postgres';

async function applyPatch() {
    const sql = postgres(connectionString, {
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connected to Database (postgres.js).');

        const sqlPath = path.join(__dirname, 'supabase/migrations/20260127000000_fix_signup_trigger.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying Patch...');
        // postgres.js doesn't support multiple statements in one `sql` tag call easily if they are not prepared?
        // Actually it does `sql.file` or just usage for simple scripts.
        // Let's use unsafe for raw query.
        await sql.unsafe(sqlContent);

        console.log('Patch Applied Successfully!');

    } catch (err) {
        console.error('Error applying patch:', err);
    } finally {
        await sql.end();
    }
}

applyPatch();
