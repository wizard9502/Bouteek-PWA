import { supabase } from "@/lib/supabaseClient";

export async function getAdminKPIs() {
    // 1. Total Revenue (Subscriptions + Commissions)
    // In a real scenario, we might have a dedicated 'platform_revenue' table or aggregate transactions
    // For now, let's sum 'subscription' type transactions from wallet_transactions (assuming these are payments TO platform)
    // And maybe commissions deducted.

    // We'll treat 'subscription' type in wallet_transactions as +Revenue for Platform
    const { data: revenueData } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('transaction_type', 'subscription');


    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Math.abs(curr.amount || 0)), 0) || 0;

    // 2. Active Merchants
    const { count: activeMerchants } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .gt('subscription_end', new Date().toISOString());

    // 3. GMV (Total Orders Volume)
    const { data: gmvData } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'paid');

    const gmv = gmvData?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;

    // 4. Pending Payouts
    const { count: pendingPayouts } = await supabase
        .from('affiliate_payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    return {
        totalRevenue,
        activeMerchants: activeMerchants || 0,
        gmv,
        pendingPayouts: pendingPayouts || 0
    };
}

export async function getSubscriptionDistribution() {
    const { data } = await supabase
        .from('merchants')
        .select('subscription_tier');

    const distribution = {
        starter: 0,
        launch: 0,
        growth: 0,
        pro: 0
    };

    data?.forEach(m => {
        if (m.subscription_tier && distribution[m.subscription_tier as keyof typeof distribution] !== undefined) {
            distribution[m.subscription_tier as keyof typeof distribution]++;
        }
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
}

export async function getRecentMerchants() {
    const { data } = await supabase
        .from('merchants')
        .select('id, business_name, subscription_tier, is_verified, created_at, contact_email')
        .order('created_at', { ascending: false })
        .limit(5);

    return data || [];
}

export async function getAllMerchants(
    page: number = 1,
    limit: number = 20,
    search?: string,
    statusFilter?: string
) {
    let query = supabase
        .from('merchants')
        .select('*, users!inner(email)', { count: 'exact' });

    if (search) {
        query = query.ilike('business_name', `%${search}%`);
    }

    if (statusFilter === 'verified') {
        query = query.eq('is_verified', true);
    } else if (statusFilter === 'unverified') {
        query = query.eq('is_verified', false);
    } else if (statusFilter === 'banned') {
        query = query.eq('is_banned', true);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return { data, count };
}

export async function toggleMerchantVerify(id: string, currentStatus: boolean) {
    const { error } = await supabase
        .from('merchants')
        .update({ is_verified: !currentStatus })
        .eq('id', id);
    return { error };
}

export async function toggleMerchantBan(id: string, currentStatus: boolean) {
    const { error } = await supabase
        .from('merchants')
        .update({ is_banned: !currentStatus })
        .eq('id', id);
    return { error };
}

export async function adjustMerchantCredit(merchantId: string, amount: number, reason: string, adminId: string) {
    // 1. Get current balance
    const { data: merchant } = await supabase.from('merchants').select('bouteek_cash_balance').eq('id', merchantId).single();
    if (!merchant) return { error: 'Merchant not found' };

    const newBalance = (merchant.bouteek_cash_balance || 0) + amount;

    // 2. Update balance
    const { error: updateError } = await supabase
        .from('merchants')
        .update({ bouteek_cash_balance: newBalance })
        .eq('id', merchantId);

    if (updateError) return { error: updateError };

    // 3. Log Transaction
    await supabase.from('wallet_transactions').insert({
        merchant_id: merchantId,
        amount: amount,
        transaction_type: 'topup', // or 'adjustment'
        description: `Admin Adjustment: ${reason}`,
        reference_id: adminId
    });


    // 4. Audit Log
    await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        action: 'ADJUST_CREDIT',
        target_type: 'merchant',
        target_id: merchantId,
        details: { amount, reason, old_balance: merchant.bouteek_cash_balance, new_balance: newBalance }
    });

    return { success: true };
}

export async function getSystemSettings(key: string) {
    const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

    return data?.value || null;
}

export async function updateSystemSettings(key: string, value: any, adminId: string) {
    // 1. Update
    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value }, { onConflict: 'key' });

    if (error) return { error };

    // 2. Audit
    await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        action: 'UPDATE_SETTINGS',
        target_type: 'system',
        target_id: key,
        details: { value }
    });

    return { success: true };
}

// --- Affiliate Payouts ---

export async function getAffiliatePayouts(status: string = 'pending') {
    let query = supabase
        .from('affiliate_payouts')
        .select(`
            *,
            merchants:referrer_id (business_name, id),
            users:referred_user_id (email, id)
        `)
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function processPayout(payoutId: string, action: 'approve' | 'pay' | 'cancel', adminId: string) {
    let status = 'pending';
    if (action === 'approve') status = 'approved';
    if (action === 'pay') status = 'paid';
    if (action === 'cancel') status = 'cancelled';

    const { error } = await supabase
        .from('affiliate_payouts')
        .update({
            status,
            processed_at: new Date().toISOString(),
            processed_by: adminId
        })
        .eq('id', payoutId);

    return { error };
}

// --- Promo Codes ---

export async function getPromoCodes() {
    const { data } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
    return data || [];
}

export async function createPromoCode(codeData: any, adminId: string) {
    const { error } = await supabase
        .from('promo_codes')
        .insert({ ...codeData, created_by: adminId });
    return { error };
}

export async function togglePromoActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);
    return { error };
}

// --- Notifications ---

export async function getNotificationCampaigns() {
    const { data } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
    return data || [];
}

export async function createNotificationCampaign(campaign: any, adminId: string) {
    const { error } = await supabase
        .from('notification_campaigns')
        .insert({
            ...campaign,
            status: 'sent', // Simulate sending immediately for now
            sent_at: new Date().toISOString(),
            created_by: adminId
        });
    return { error };
}

// --- Audit ---

export async function getAuditLogs() {
    const { data } = await supabase
        .from('admin_audit_logs')
        .select('*, users:admin_id(email)')
        .order('created_at', { ascending: false })
        .limit(50);
    return data || [];
}

export async function getRevenueGrowthData() {
    // 1. Fetch last 7 days of transactions (subscriptions) and orders (commissions)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: subs } = await supabase
        .from('wallet_transactions')
        .select('created_at, amount')
        .eq('transaction_type', 'subscription')
        .gte('created_at', sevenDaysAgo.toISOString());

    const { data: orders } = await supabase
        .from('orders')
        .select('created_at, commission')
        .eq('status', 'paid')
        .gte('created_at', sevenDaysAgo.toISOString());

    // Map to days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            name: days[d.getDay()],
            sub: 0,
            com: 0,
            date: d.toISOString().split('T')[0]
        };
    });

    subs?.forEach(s => {
        const date = s.created_at.split('T')[0];
        const day = result.find(r => r.date === date);
        if (day) day.sub += Math.abs(s.amount || 0);
    });

    orders?.forEach(o => {
        const date = o.created_at.split('T')[0];
        const day = result.find(r => r.date === date);
        if (day) day.com += (o.commission || 0);
    });

    return result;
}

