import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function inspect() {
    console.log("🔍 Inspecting Merchants Table Columns...");

    // Select one row
    const { data, error } = await supabase.from('merchants').select('*').limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else if (data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log("Columns found:", keys.join(", "));

        if (keys.includes('business_name')) {
            console.log("✅ business_name exists.");
        } else if (keys.includes('name')) {
            console.log("⚠️ Found 'name' instead of 'business_name'. Migration needed.");
        } else {
            console.log("❌ Neither business_name nor name found?");
        }
    } else {
        console.log("Table empty, cannot infer columns from row.");
        // Try inserting a dummy? No.
    }
}

inspect();
