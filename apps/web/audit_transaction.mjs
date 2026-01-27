import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function auditTransactions() {
    console.log("💰 Starting Transactional Circuit Audit...");

    // 1. Fetch Paid Orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
        .limit(50); // Sample size

    if (error) { console.error("Fetch orders error:", error); return; }
    console.log(`Analyzing ${orders.length} PAID orders...`);

    let gaps = 0;

    for (const order of orders) {
        // 2. Check for matching Wallet Transaction
        // Assuming wallet_transactions has reference_id = order.id
        const { data: tx } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('reference_id', order.id)
            .eq('transaction_type', 'sale') // or 'credit'
            .maybeSingle();

        if (!tx) {
            console.warn(`❌ GAP: Order ${order.id} (Amount: ${order.total}) has NO Wallet Transaction!`);
            gaps++;
        } else {
            // 3. Optional: Verify amount matches (Revenue - Commission)
            // We'd need to calculate commission to be sure, but existence is the first check.
            // console.log(`✅ Order ${order.id} matched with TX ${tx.id}`);
        }
    }

    if (gaps > 0) {
        console.log(`❌ FAILED: Found ${gaps} broken transactional circuits.`);
    } else {
        console.log("✅ PASSED: All sampled paid orders have wallet entries.");
    }
}

auditTransactions().catch(console.error);
