import { supabase } from "@/lib/supabaseClient";

export async function getAdminKPIs() {
    try {
        // 1. Subscription Revenue (Hardened)
        let revenueData: any[] = [];
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('amount, created_at')
                .eq('transaction_type', 'subscription');
            if (error) {
                console.warn("KPI: wallet_transactions fetch warn", error.message);
            } else {
                revenueData = data || [];
            }
        } catch (e) {
            console.error("KPI: wallet_transactions crit error", e);
        }

        // 2. Commission Revenue from Orders (Hardened)
        let commissionData: any[] = [];
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('commission, created_at')
                .eq('status', 'paid');
            if (error) {
                console.warn("KPI: orders fetch warn", error.message);
            } else {
                commissionData = data || [];
            }
        } catch (e) {
            console.error("KPI: orders crit error", e);
        }

        const subscriptionRevenue = revenueData.reduce((acc, curr) => acc + (Math.abs(curr.amount || 0)), 0);
        const commissionRevenue = commissionData.reduce((acc, curr) => acc + (curr.commission || 0), 0);
        const totalRevenue = subscriptionRevenue + commissionRevenue;

        // Growth Calculation
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const thisMonthSubs = revenueData.filter(r => new Date(r.created_at) >= thirtyDaysAgo).reduce((acc, curr) => acc + (Math.abs(curr.amount || 0)), 0);
        const lastMonthSubs = revenueData.filter(r => new Date(r.created_at) < thirtyDaysAgo && new Date(r.created_at) >= sixtyDaysAgo).reduce((acc, curr) => acc + (Math.abs(curr.amount || 0)), 0);
        const revenueGrowth = lastMonthSubs > 0 ? ((thisMonthSubs - lastMonthSubs) / lastMonthSubs) * 100 : (thisMonthSubs > 0 ? 100 : 0);

        // 3. Active Merchants (Hardened)
        let activeMerchants = 0;
        let newMerchantsThisMonth = 0;
        try {
            const { count } = await supabase
                .from('merchants')
                .select('*', { count: 'exact', head: true })
                .gt('subscription_end', new Date().toISOString());
            activeMerchants = count || 0;

            const { count: nm } = await supabase
                .from('merchants')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());
            newMerchantsThisMonth = nm || 0;
        } catch (e) {
            console.error("KPI: merchants fetch error", e);
        }

        // 4. GMV (Hardened)
        let gmv = 0;
        let gmvGrowth = 0;
        try {
            const { data } = await supabase
                .from('orders')
                .select('total, created_at')
                .eq('status', 'paid');

            if (data) {
                gmv = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
                const thisMonthGMV = data.filter(o => new Date(o.created_at) >= thirtyDaysAgo).reduce((acc, curr) => acc + (curr.total || 0), 0);
                const lastMonthGMV = data.filter(o => new Date(o.created_at) < thirtyDaysAgo && new Date(o.created_at) >= sixtyDaysAgo).reduce((acc, curr) => acc + (curr.total || 0), 0);
                gmvGrowth = lastMonthGMV > 0 ? ((thisMonthGMV - lastMonthGMV) / lastMonthGMV) * 100 : (thisMonthGMV > 0 ? 100 : 0);
            }
        } catch (e) {
            console.error("KPI: gmv fetch error", e);
        }

        // 5. Pending Payouts (Hardened)
        let pendingPayouts = 0;
        try {
            const { count, error: payoutError } = await supabase
                .from('affiliate_payouts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            if (!payoutError) {
                pendingPayouts = count || 0;
            }
        } catch (e) {
            console.warn("KPI: affiliate_payouts err", e);
        }

        return {
            totalRevenue,
            subscriptionRevenue,
            commissionRevenue,
            revenueGrowth: Number(revenueGrowth.toFixed(1)),
            activeMerchants,
            newMerchantsThisMonth,
            gmv,
            gmvGrowth: Number(gmvGrowth.toFixed(1)),
            pendingPayouts
        };
    } catch (criticalError) {
        console.error("OVERALL KPI DATA HYDRATION CRASHED:", criticalError);
        return {
            totalRevenue: 0,
            subscriptionRevenue: 0,
            commissionRevenue: 0,
            revenueGrowth: 0,
            activeMerchants: 0,
            newMerchantsThisMonth: 0,
            gmv: 0,
            gmvGrowth: 0,
            pendingPayouts: 0
        };
    }
}

export async function getSubscriptionDistribution() {
    try {
        const { data, error } = await supabase
            .from('merchants')
            .select('subscription_tier');

        if (error) throw error;

        const distribution = { starter: 0, launch: 0, growth: 0, pro: 0 };
        data?.forEach(m => {
            const tier = m.subscription_tier?.toLowerCase();
            if (tier && distribution[tier as keyof typeof distribution] !== undefined) {
                distribution[tier as keyof typeof distribution]++;
            }
        });

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    } catch (error) {
        console.error("Distribution logic failure", error);
        return [
            { name: 'starter', value: 0 },
            { name: 'launch', value: 0 },
            { name: 'growth', value: 0 },
            { name: 'pro', value: 0 }
        ];
    }
}

export async function getRecentMerchants() {
    try {
        const { data, error } = await supabase
            .from('merchants')
            .select('id, business_name, subscription_tier, is_verified, created_at, contact_email')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Recent merchants logic failure", error);
        return [];
    }
}

export async function getAllMerchants(
    page: number = 1,
    limit: number = 20,
    search?: string,
    statusFilter?: string
) {
    try {
        let query = supabase
            .from('merchants')
            .select('*', { count: 'exact' });

        if (search) query = query.ilike('business_name', `%${search}%`);

        if (statusFilter === 'verified') query = query.eq('is_verified', true);
        else if (statusFilter === 'unverified') query = query.eq('is_verified', false);
        else if (statusFilter === 'banned') query = query.eq('is_banned', true);

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        // Resilient User Join
        if (data && data.length > 0) {
            try {
                const userIds = data.map(m => m.user_id).filter(id => !!id);
                if (userIds.length > 0) {
                    const { data: users } = await supabase
                        .from('users')
                        .select('id, email')
                        .in('id', userIds);

                    if (users) {
                        data.forEach(m => {
                            const user = users.find(u => u.id === m.user_id);
                            m.users = user ? { email: user.email } : null;
                        });
                    }
                }
            } catch (e) { console.error("Merchant User Join failed", e); }
        }

        return { data: data || [], count: count || 0 };
    } catch (error) {
        console.error("All merchants logic failure", error);
        return { data: [], count: 0 };
    }
}

export async function toggleMerchantVerify(id: string, currentStatus: boolean) {
    try {
        const { error } = await supabase
            .from('merchants')
            .update({ is_verified: !currentStatus })
            .eq('id', id);
        return { error };
    } catch (e: any) { return { error: e }; }
}

export async function toggleMerchantBan(id: string, currentStatus: boolean) {
    try {
        const { error } = await supabase
            .from('merchants')
            .update({ is_banned: !currentStatus })
            .eq('id', id);
        return { error };
    } catch (e: any) { return { error: e }; }
}

export async function adjustMerchantCredit(merchantId: string, amount: number, reason: string, adminId: string) {
    try {
        const { data: merchant, error: fetchError } = await supabase.from('merchants').select('bouteek_cash_balance').eq('id', merchantId).single();
        if (fetchError || !merchant) return { error: 'Merchant not found' };

        const newBalance = (merchant.bouteek_cash_balance || 0) + amount;

        const { error: updateError } = await supabase
            .from('merchants')
            .update({ bouteek_cash_balance: newBalance })
            .eq('id', merchantId);

        if (updateError) return { error: updateError };

        // Log Transaction (Resilient)
        try {
            await supabase.from('wallet_transactions').insert({
                merchant_id: merchantId,
                amount: amount,
                transaction_type: 'topup',
                description: `Admin Adjustment: ${reason}`,
                reference_id: adminId
            });
        } catch (e) { console.error("Wallet log fail", e); }

        // Audit Log (Resilient)
        try {
            await supabase.from('admin_audit_logs').insert({
                admin_id: adminId,
                action: 'ADJUST_CREDIT',
                target_type: 'merchant',
                target_id: merchantId,
                details: { amount, reason, old_balance: merchant.bouteek_cash_balance, new_balance: newBalance }
            });
        } catch (e) { console.error("Audit log fail", e); }

        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Adjustment crashed" };
    }
}

export async function getSystemSettings(key: string) {
    try {
        const { data } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single();
        return data?.value || null;
    } catch (error) {
        console.error("System settings failed", error);
        return null;
    }
}

export async function updateSystemSettings(key: string, value: any, adminId: string) {
    try {
        const { error } = await supabase
            .from('system_settings')
            .upsert({ key, value }, { onConflict: 'key' });

        if (error) return { error };

        try {
            await supabase.from('admin_audit_logs').insert({
                admin_id: adminId,
                action: 'UPDATE_SETTINGS',
                target_type: 'system',
                target_id: key,
                details: { value }
            });
        } catch (e) { console.error("System audit crashed", e); }

        return { success: true };
    } catch (e: any) { return { error: e.message }; }
}

export async function getAffiliatePayouts(status: string = 'pending') {
    try {
        let query = supabase
            .from('affiliate_payouts')
            .select(`*`)
            .order('created_at', { ascending: false });

        if (status !== 'all') query = query.eq('status', status);

        const { data, error } = await query;
        if (error) return [];

        if (data && data.length > 0) {
            try {
                const referrerIds = Array.from(new Set(data.map(p => p.referrer_id).filter(id => !!id)));
                const referredIds = Array.from(new Set(data.map(p => p.referred_user_id).filter(id => !!id)));

                const [{ data: merchants }, { data: users }] = await Promise.all([
                    supabase.from('merchants').select('id, business_name').in('id', referrerIds),
                    supabase.from('users').select('id, email').in('id', referredIds)
                ]);

                data.forEach(p => {
                    p.merchants = merchants?.find(m => m.id === p.referrer_id) || null;
                    p.users = users?.find(u => u.id === p.referred_user_id) || null;
                });
            } catch (e) { console.error("Payout join crashed", e); }
        }

        return data || [];
    } catch (error) {
        console.warn("Affiliate logic failure", error);
        return [];
    }
}

export async function processPayout(payoutId: string, action: 'approve' | 'pay' | 'cancel', adminId: string) {
    try {
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
    } catch (e: any) { return { error: e }; }
}

export async function getPromoCodes() {
    try {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return [];
        return data || [];
    } catch (error) {
        console.error("Promo codes logic failure", error);
        return [];
    }
}

export async function createPromoCode(codeData: any, adminId: string) {
    try {
        const { error } = await supabase
            .from('promo_codes')
            .insert({ ...codeData, created_by: adminId });
        return { error };
    } catch (e: any) { return { error: e }; }
}

export async function togglePromoActive(id: string, currentStatus: boolean) {
    try {
        const { error } = await supabase
            .from('promo_codes')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        return { error };
    } catch (e: any) { return { error: e }; }
}

export async function getNotificationCampaigns() {
    try {
        const { data, error } = await supabase
            .from('notification_campaigns')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return [];
        return data || [];
    } catch (error) {
        console.error("Notification campaigns crashed", error);
        return [];
    }
}

export async function createNotificationCampaign(campaign: any, adminId: string) {
    try {
        const { error } = await supabase
            .from('notification_campaigns')
            .insert({
                ...campaign,
                status: 'pending',
                created_by: adminId
            });
        return { error };
    } catch (e: any) { return { error: e }; }
}

export async function getAuditLogs() {
    try {
        const { data, error } = await supabase
            .from('admin_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return [];

        if (data && data.length > 0) {
            try {
                const adminIds = Array.from(new Set(data.map(l => l.admin_id).filter(id => !!id)));
                const { data: users } = await supabase.from('users').select('id, email').in('id', adminIds);

                data.forEach(l => {
                    l.users = users?.find(u => u.id === l.admin_id) || null;
                });
            } catch (e) { console.error("Audit log core join crashed", e); }
        }
        return data || [];
    } catch (error) {
        console.error("Audit logic failure", error);
        return [];
    }
}

export async function getRevenueGrowthData() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let subs: any[] = [];
        try {
            const { data } = await supabase
                .from('wallet_transactions')
                .select('created_at, amount')
                .eq('transaction_type', 'subscription')
                .gte('created_at', sevenDaysAgo.toISOString());
            subs = data || [];
        } catch (e) { console.warn("Growth: subs fetch failed", e); }

        let orders: any[] = [];
        try {
            const { data } = await supabase
                .from('orders')
                .select('created_at, commission')
                .eq('status', 'paid')
                .gte('created_at', sevenDaysAgo.toISOString());
            orders = data || [];
        } catch (e) { console.warn("Growth: orders fetch failed", e); }

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

        subs.forEach(s => {
            const date = s.created_at?.split('T')[0];
            const day = result.find(r => r.date === date);
            if (day) day.sub += Math.abs(s.amount || 0);
        });

        orders.forEach(o => {
            const date = o.created_at?.split('T')[0];
            const day = result.find(r => r.date === date);
            if (day) day.com += (o.commission || 0);
        });

        return result;
    } catch (error) {
        console.error("Growth chart logic failure", error);
        return [];
    }
}

export async function getMerchantDetails(id: string) {
    try {
        const { data, error } = await supabase
            .from('merchants')
            .select('*, users(email), storefronts(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Merchant detail fetch failed", error);
        return null;
    }
}

export async function getMerchantOrders(merchantId: string, limit: number = 50) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Merchant orders fetch failed", error);
        return [];
    }
}
