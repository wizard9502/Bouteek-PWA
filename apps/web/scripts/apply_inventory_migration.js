const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Credentials from existing script
const connectionString = 'postgres://postgres:yF9XEbWu0ExB0RpL@db.gkrfphdrxthssxrxgdlr.supabase.co:5432/postgres';

const sql = postgres(connectionString, {
    ssl: 'require'
});

async function run() {
    console.log('Connecting to database...');
    try {
        // Apply inventory engine migration
        const inventoryMigrationPath = path.join(__dirname, '../supabase/migrations/20260122100000_inventory_engine.sql');
        if (fs.existsSync(inventoryMigrationPath)) {
            console.log('Applying inventory engine migration...');
            const inventorySql = fs.readFileSync(inventoryMigrationPath, 'utf8');
            await sql.unsafe(inventorySql);
            console.log('✓ Inventory engine migration applied!');
        }

        // Apply primary image migration
        const primaryImagePath = path.join(__dirname, '../supabase/migrations/20260122100001_primary_image.sql');
        if (fs.existsSync(primaryImagePath)) {
            console.log('Applying primary image migration...');
            const primaryImageSql = fs.readFileSync(primaryImagePath, 'utf8');
            await sql.unsafe(primaryImageSql);
            console.log('✓ Primary image migration applied!');
        }

        console.log('\n✓ All migrations applied successfully!');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        await sql.end();
    }
}

run();
