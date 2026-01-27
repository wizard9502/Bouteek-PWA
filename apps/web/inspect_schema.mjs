import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspect() {
    console.log("🔍 Inspecting Storefronts Schema...");

    // Attempt to select 'layout_config' from 'storefronts'
    const { data, error } = await supabase.from('storefronts').select('layout_config').limit(1);

    if (error) {
        console.log("❌ layout_config column likely MISSING or inaccessible.");
        console.error("Error:", error.message);
    } else {
        console.log("✅ layout_config column EXISTS.");
        if (data.length > 0) {
            console.log("Sample value:", JSON.stringify(data[0]));
        } else {
            console.log("Table empty, but query succeeded.");
        }
    }
}

inspect();
