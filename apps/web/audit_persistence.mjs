import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function audit() {
    console.log("🕵️ Starting Persistence & Plumbing Audit...");
    const report = {
        orphanedUsers: 0,
        orphanedMerchants: 0,
        missingWallets: 0,
        missingStorefronts: 0,
        missingLayoutConfig: 0
    };

    // 1. Fetch Users (Auth)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error("Failed to list users:", usersError);
        return;
    }
    console.log(`Found ${users.length} Auth Users.`);

    // 2. Fetch Merchants (Public)
    const { data: merchants } = await supabase.from('merchants').select('*');
    console.log(`Found ${merchants.length} Merchant profiles.`);

    // Check Auth -> Merchant Link
    const merchantUserIds = new Set(merchants.map(m => m.user_id));

    for (const user of users) {
        // Skip admin@bouteek.shop or known admins if needed, but technically they should have profiles too if they are users.
        // Assuming strict 1:1 for merchants.
        if (user.user_metadata?.role === 'admin') continue; // Admins might not be merchants

        if (!merchantUserIds.has(user.id)) {
            console.warn(`⚠️ Orphan User (No Merchant Profile): ${user.email} (${user.id})`);
            report.orphanedUsers++;
        }
    }

    // 3. Fetch Storefronts
    const { data: storefronts } = await supabase.from('storefronts').select('*');
    const merchantIdsWithStore = new Set(storefronts.map(s => s.merchant_id));

    // 4. Check Merchant Orphans (No Storefront, No Wallet)
    for (const merchant of merchants) {
        // Check Storefront
        if (!merchantIdsWithStore.has(merchant.id)) {
            console.warn(`⚠️ Orphan Merchant (No Storefront): ${merchant.business_name} (${merchant.id})`);
            report.missingStorefronts++;
        }

        // Check Wallet (Balance column existence is implicit, but let's check if it creates transactions or has balance field)
        // Actually, we just check if the column exists in data.
        if (merchant.bouteek_cash_balance === undefined || merchant.bouteek_cash_balance === null) {
            console.warn(`⚠️ Broken Wallet (No Balance Field): ${merchant.business_name}`);
            report.missingWallets++;
        }
    }

    // 5. Check Layout Config Validation
    for (const store of storefronts) {
        if (!store.layout_config || (Array.isArray(store.layout_config) && store.layout_config.length === 0)) {
            // It's allowed to be empty, but let's note it.
            // Actually, for "Zero-Gaps", we expect new stores to have a default?
            // User asked: "Verify that the layout_config (JSONB) isn't just a local variable."
            // So we check if DB has it.
            console.log(`ℹ️ Store ${store.slug} layout_config:`, JSON.stringify(store.layout_config).substring(0, 50) + "...");
            if (!store.layout_config) report.missingLayoutConfig++;
        }
    }

    console.log("\n📊 Audit Report:");
    console.table(report);

    if (report.orphanedUsers > 0 || report.missingStorefronts > 0) {
        console.log("❌ GAP DETECTED: Persistence Chain is broken for some entities.");
    } else {
        console.log("✅ Persistence Chain seems intact.");
    }
}

audit().catch(console.error);
