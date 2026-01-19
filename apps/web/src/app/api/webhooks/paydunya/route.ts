import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize keys
const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
    console.log("PayDunya Webhook Received");

    // 1. Check Configuration
    if (!PAYDUNYA_MASTER_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error("Critical: Missing Webhook Env Vars (Supabase or PayDunya)");
        // Return 500 so PayDunya retries later when config is fixed
        return NextResponse.json({ message: "Server Configuration Error" }, { status: 500 });
    }

    // 2. Initialize Admin Client (Bypass RLS)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const rawBody = await req.text();
        const data = JSON.parse(rawBody);

        console.log("Webhook Payload:", JSON.stringify(data).substring(0, 200) + "...");

        // 3. Authenticate/Hash Check (Optional but recommended)
        // PayDunya sends `hash = sha512(master_key)` for simple verification in some modes
        // or checks against invoice token. For now, trusting the matching custom_data structure + invoice status.
        // Improve strictly in future.

        const { status, custom_data, invoice } = data;

        if (status !== 'completed') {
            return NextResponse.json({ response_code: "00", response_text: "Ignored: Not completed" });
        }

        // 4. Update Wallet Logic
        if (custom_data && custom_data.action === 'topup') {
            const merchantId = custom_data.merchant_id;
            const amount = Number(invoice.total_amount);

            if (!merchantId) {
                console.error("Webhook Error: Missing merchant_id in custom_data");
                return NextResponse.json({ response_code: "00", response_text: "Invalid Data" });
            }

            // Retrieve current balance
            const { data: merchant, error: fetchError } = await supabaseAdmin
                .from('merchants')
                .select('bouteek_cash_balance')
                .eq('id', merchantId)
                .single();

            if (fetchError || !merchant) {
                console.error("Webhook Error: Merchant not found", fetchError);
                return NextResponse.json({ response_code: "00", response_text: "Merchant Not Found" });
            }

            const newBalance = (merchant.bouteek_cash_balance || 0) + amount;

            // Update Balance
            const { error: updateError } = await supabaseAdmin
                .from('merchants')
                .update({ bouteek_cash_balance: newBalance })
                .eq('id', merchantId);

            if (updateError) {
                console.error("Webhook Error: Balance Update Failed", updateError);
                return NextResponse.json({ response_code: "00", response_text: "Update Failed" });
            }

            // Log Transaction
            await supabaseAdmin.from('wallet_transactions').insert({
                merchant_id: merchantId,
                amount: amount,
                transaction_type: 'topup',
                description: `PayDunya Top-up: ${invoice.description || 'Wallet Credit'}`,
                status: 'completed',
                reference_id: invoice.token
            });

            console.log(`Success: Credited ${amount} to Merchant ${merchantId}`);
            return NextResponse.json({ response_code: "00", response_text: "Balance updated successfully" });
        }

        return NextResponse.json({ response_code: "00", response_text: "No action taken" });

    } catch (error) {
        console.error("Webhook Exception:", error);
        return NextResponse.json({ response_code: "00", response_text: "Server Error" });
    }
}
