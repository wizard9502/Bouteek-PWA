const postgres = require('postgres');

const projectRef = 'gkrfphdrxthssxrxgdlr';
const password = 'yF9XEbWu0ExB0RpL';

const regions = [
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com', // correct? typical is just aws-0-[region]
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-sa-east-1.pooler.supabase.com',
    // Try direct just in case DNS was transient
    'db.gkrfphdrxthssxrxgdlr.supabase.co'
];

const connectionVariations = [
    { user: `postgres.${projectRef}`, port: 6543 }, // Pooler Transaction
    { user: `postgres.${projectRef}`, port: 5432 }, // Pooler Session
    { user: 'postgres', port: 5432 } // Direct (less likely on poolers)
];

async function check(host, variation) {
    const url = `postgres://${variation.user}:${password}@${host}:${variation.port}/postgres?sslmode=require`;
    const sql = postgres(url, { connect_timeout: 3, max_lifetime: 5 }); // fast fail

    try {
        await sql`SELECT 1`;
        console.log(`SUCCESS: Connected to ${host} on port ${variation.port} as ${variation.user}`);
        console.log(`URL: ${url}`);
        return true;
    } catch (e) {
        // console.log(`Failed ${host}:${variation.port} - ${e.message}`);
        return false;
    } finally {
        await sql.end();
    }
}

async function run() {
    console.log('Scanning for valid DB Connection...');
    for (const host of regions) {
        for (const v of connectionVariations) {
            if (await check(host, v)) {
                process.exit(0);
            }
        }
    }
    console.log('Scan Complete. No valid connection found.');
}

run();
