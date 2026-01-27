const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkrfphdrxthssxrxgdlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcmZwaGRyeHRoc3N4cnhnZGxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwMDAyNiwiZXhwIjoyMDgyNTc2MDI2fQ.B07Eo0TBaOJGuLdVIxtcggLc5PBFqdFXPmPS6Rcx7kU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check(col) {
    const { error } = await supabase.from('merchants').select(col).limit(1);
    return !error;
}

async function run() {
    console.log('Auditing Columns...');

    const map = {
        'business_name': 'businessName',
        'subscription_tier': 'subscriptionTier',
        'is_verified': 'isVerified',
        'is_banned': 'isBanned',
        'bouteek_cash_balance': 'bouteekCashBalance'
    };

    for (const [snake, camel] of Object.entries(map)) {
        const snakeExists = await check(snake);
        const camelExists = await check(camel);

        console.log(`${snake}: ${snakeExists ? 'EXISTS' : 'MISSING'}`);
        console.log(`${camel}: ${camelExists ? 'EXISTS' : 'MISSING'}`);

        if (camelExists && !snakeExists) {
            console.log(`>>> DETECTED DRIFT: ${camel} should be ${snake}`);
        }
    }
}

run();
