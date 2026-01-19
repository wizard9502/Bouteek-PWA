"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamicImport from "next/dynamic";
import {
    TrendingUp,
    BarChart3,
    Users,
    CreditCard,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Dynamic import for Recharts components to prevent SSR crashes
export const dynamic = 'force-dynamic';

const RevenueGrowthChart = dynamicImport(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.RevenueGrowthChart),
    { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-gray-100 rounded-xl" /> }
);

const SubscriptionDistributionChart = dynamicImport(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.SubscriptionDistributionChart),
    { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-gray-100 rounded-xl" /> }
);

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalGMV: 0,
        platformRevenue: 0,
        growthRate: 12.4,
        activeSellers: 0
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        fetchAdminInsights();
    }, []);

    const fetchAdminInsights = async () => {
        try {
            // GMV (Paid Orders)
            const { data: orders } = await supabase.from('orders').select('total').eq('status', 'paid');
            const gmv = orders?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;

            // Platform Revenue (Subscription transactions)
            const { data: txs } = await supabase.from('wallet_transactions').select('amount').eq('transaction_type', 'subscription');
            const rev = txs?.reduce((acc, curr) => acc + Math.abs(curr.amount || 0), 0) || 0;

            // Seller Count
            const { count } = await supabase.from('merchants').select('*', { count: 'exact', head: true });

            setStats({
                totalGMV: gmv,
                platformRevenue: rev,
                growthRate: 15.8,
                activeSellers: count || 0
            });

            // Mock revenue over time
            setRevenueData([
                { name: 'Week 1', revenue: 450000, gmv: 2500000 },
                { name: 'Week 2', revenue: 520000, gmv: 3100000 },
                { name: 'Week 3', revenue: 480000, gmv: 2800000 },
                { name: 'Week 4', revenue: 610000, gmv: 4200000 },
                { name: 'Week 5', revenue: 750000, gmv: 5600000 },
                { name: 'Week 6', revenue: 890000, gmv: 6800000 },
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Platform Analytics</h1>
                    <p className="text-muted-foreground font-medium mt-1">Real-time performance metrics for Bouteek Ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl h-12 font-bold px-6">
                        <Calendar className="mr-2" size={18} />
                        Last 30 Days
                    </Button>
                    <Button className="rounded-2xl h-12 bg-black text-white font-bold px-6 shadow-xl shadow-black/20">
                        Export Full Audit
                    </Button>
                </div>
            </div>

            {/* Platform KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-3xl border-border/50 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-black">
                            <ArrowUpRight size={14} />
                            +15%
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total GMV</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-900">{stats.totalGMV.toLocaleString()} XOF</h3>
                    </div>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                            <CreditCard size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-black">
                            <ArrowUpRight size={14} />
                            +8%
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Platform Income</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-900">{stats.platformRevenue.toLocaleString()} XOF</h3>
                    </div>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                            <Users size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-black">
                            <ArrowUpRight size={14} />
                            +24
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Sellers</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-900">{stats.activeSellers.toLocaleString()}</h3>
                    </div>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                            <BarChart3 size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-red-600 text-xs font-black">
                            <ArrowDownRight size={14} />
                            -2.1%
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Churn Rate</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-900">4.2%</h3>
                    </div>
                </Card>
            </div>

            {/* Growth Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-4xl border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="p-8 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black">Revenue & Volume Growth</CardTitle>
                                <CardDescription className="font-medium mt-1">Weekly snapshot of ecosystem economics.</CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">GMV (x0.1)</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <RevenueGrowthChart data={revenueData} />
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="rounded-4xl border-border/50 shadow-sm p-8 bg-black text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black">Optimization Engine</h4>
                            <p className="text-sm text-gray-400 mt-2 font-medium">System suggests increasing commission on 'Starter' tier to 6% based on current infrastructure costs.</p>
                            <Button className="w-full mt-6 rounded-2xl bg-bouteek-green text-black font-black uppercase tracking-widest h-12">Run ROI Analysis</Button>
                        </div>
                        <TrendingUp size={120} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12" />
                    </Card>

                    <Card className="rounded-4xl border-border/50 shadow-sm p-8">
                        <h4 className="font-black mb-6">Top Performing Regions</h4>
                        <div className="space-y-6">
                            {[
                                { name: "Dakar, Senegal", share: 64, color: "bg-emerald-500" },
                                { name: "Abidjan, CI", share: 22, color: "bg-blue-500" },
                                { name: "Bamako, Mali", share: 14, color: "bg-orange-500" },
                            ].map((reg) => (
                                <div key={reg.name} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>{reg.name}</span>
                                        <span>{reg.share}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${reg.share}%` }}
                                            className={cn("h-full", reg.color)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Merchant Activity Snapshot */}
            <Card className="rounded-4xl border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="p-8 border-b">
                    <CardTitle className="text-xl font-black">Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="h-[300px]">
                        <SubscriptionDistributionChart data={[
                            { tier: 'Starter', users: 420 },
                            { tier: 'Launch', users: 180 },
                            { tier: 'Growth', users: 95 },
                            { tier: 'Pro', users: 34 }
                        ]} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
