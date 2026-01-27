const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Credentials provided by user
const connectionString = 'postgres://postgres:yF9XEbWu0ExB0RpL@db.gkrfphdrxthssxrxgdlr.supabase.co:5432/postgres';

async function applyPatch() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('Connected to Database.');

        const sqlPath = path.join(__dirname, 'supabase/migrations/20260127000000_fix_signup_trigger.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying Patch...');
        await client.query(sql);
        console.log('Patch Applied Successfully!');

    } catch (err) {
        console.error('Error applying patch:', err);
    } finally {
        await client.end();
    }
}

applyPatch();
