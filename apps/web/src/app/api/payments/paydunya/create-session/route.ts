import { NextRequest, NextResponse } from 'next/server';

const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
const PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
const PAYDUNYA_TOKEN = process.env.PAYDUNYA_TOKEN;

export async function POST(req: NextRequest) {
    if (!PAYDUNYA_MASTER_KEY || !PAYDUNYA_PRIVATE_KEY || !PAYDUNYA_TOKEN) {
        console.error("PayDunya Config Missing: Check Railway Env Vars");
        return NextResponse.json({
            message: "Configuration Error: Payment Gateway Keys Missing on Server"
        }, { status: 500 });
    }

    try {
        const { amount, merchantId, userId, businessName } = await req.json();

        if (!amount || !merchantId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const payload = {
            invoice: {
                total_amount: amount,
                description: `Bouteek Cash Top-up for ${businessName}`,
                items: [
                    {
                        name: "Bouteek Cash Credit",
                        quantity: 1,
                        unit_price: amount,
                        total_price: amount,
                        description: "Wallet credit for subscription and commission payments"
                    }
                ]
            },
            store: {
                name: "Bouteek PWA",
                tagline: "Your Digital Storefront Empire",
                phone: "221770000000",
                logo_url: "https://bouteek.shop/logo.png"
            },
            custom_data: {
                merchant_id: merchantId,
                user_id: userId,
                action: 'topup'
            },
            actions: {
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bouteek-pwa.vercel.app'}/dashboard/finance?status=cancelled`,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bouteek-pwa.vercel.app'}/dashboard/finance?status=success`
            }
        };

        const response = await fetch('https://app.paydunya.com/api/v1/checkout-invoice/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'PAYDUNYA-MASTER-KEY': PAYDUNYA_MASTER_KEY || '',
                'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_PRIVATE_KEY || '',
                'PAYDUNYA-TOKEN': PAYDUNYA_TOKEN || ''
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.response_code === '00') {
            return NextResponse.json({ url: data.response_text });
        } else {
            console.error("PayDunya Error:", data);
            return NextResponse.json({ message: data.response_text || "Payment Session Error" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
