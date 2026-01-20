"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import {
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    Search,
    ChevronRight,
    ShoppingCart,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";



import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with canvas
const DashboardRevenueChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.DashboardRevenueChart),
    { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-xl" /> }
);

export default function DashboardHome() {
    return (
        <TranslationProvider>
            <DashboardHomeContent />
        </TranslationProvider>
    );
}

function DashboardHomeContent() {
    const { t, language } = useTranslation();

    const [stats, setStats] = useState({
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        balance: 0,
        subscription: {
            plan: "Starter",
            start_date: null,
            end_date: null,
            percentage: 0
        },
        lowStockCount: 0
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState("30d");

    useEffect(() => {
        fetchDashboardData(timeframe);
    }, [timeframe]);

    const fetchDashboardData = async (range: string = "30d") => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase.from('merchants').select('id, bouteek_cash_balance, subscription_tier, subscription_start, subscription_end').eq('user_id', user.id).single();
            if (!merchant) return;

            // Fetch Orders for stats
            const { data: orders } = await supabase
                .from('orders')
                .select('status, total, created_at')
                .eq('merchant_id', merchant.id);

            // Fetch Low Stock Listings
            const { data: listings } = await supabase
                .from('listings')
                .select('metadata, module_type')
                .eq('store_id', merchant.id)
                .eq('module_type', 'sale');

            let lowStock = 0;
            listings?.forEach(l => {
                const stockLevel = l.metadata?.stock_level || 0;
                const threshold = l.metadata?.low_stock_threshold || 5;
                if (stockLevel <= threshold) {
                    lowStock++;
                }
            });

            let today = 0, week = 0, month = 0, total = 0;
            let pending = 0, completed = 0, active = 0, cancelled = 0;

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            orders?.forEach(order => {
                const amount = order.total || 0;
                const date = new Date(order.created_at);

                // Calculate Revenue (Paid or Completed)
                if (order.status === 'paid' || order.status === 'completed') {
                    total += amount;
                    if (date >= startOfDay) today += amount;
                    if (date >= startOfWeek) week += amount;
                    if (date >= startOfMonth) month += amount;
                }

                // Count Statuses
                if (order.status === 'pending') pending++;
                else if (order.status === 'completed') completed++;
                else if (order.status === 'active' || order.status === 'paid') active++;
                else if (order.status === 'cancelled') cancelled++;
            });

            setStats({
                todayRevenue: today,
                weekRevenue: week,
                monthRevenue: month,
                totalRevenue: total,
                pendingOrders: pending,
                completedOrders: completed,
                activeOrders: active,
                cancelledOrders: cancelled,
                balance: merchant.bouteek_cash_balance || 0,
                subscription: {
                    plan: merchant.subscription_tier || "Starter",
                    start_date: merchant.subscription_start,
                    end_date: merchant.subscription_end,
                    percentage: calculateSubscriptionPercentage(merchant.subscription_start, merchant.subscription_end)
                },
                lowStockCount: lowStock
            });


            // 3. Timeframe logic for chart
            const daysAgo = new Date();
            let days = 30;
            if (range === '14d') days = 14;
            else if (range === '90d') days = 90;
            else if (range === '1y') days = 365;
            daysAgo.setDate(daysAgo.getDate() - days);

            const { data: chartOrders } = await supabase
                .from('orders')
                .select('created_at, total')
                .eq('merchant_id', merchant.id)
                .or('status.eq.paid,status.eq.completed') // Only count valid sales
                .gte('created_at', daysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (chartOrders && chartOrders.length > 0) {
                const grouped = chartOrders.reduce((acc: any, curr: any) => {
                    const date = new Date(curr.created_at).toISOString().split('T')[0]; // YYYY-MM-DD
                    acc[date] = (acc[date] || 0) + (curr.total || 0);
                    return acc;
                }, {});
                setChartData(Object.entries(grouped).map(([name, revenue]) => ({ name, revenue })));
            } else {
                setChartData([]);
            }
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        }
    };




    const calculateSubscriptionPercentage = (start: any, end: any) => {
        if (!start || !end) return 0;
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const now = new Date().getTime();
        const total = endTime - startTime;
        const progress = now - startTime;
        return Math.min(Math.max((progress / total) * 100, 0), 100);
    };



    const statsCards = [
        { label: t("dashboard.stats.today"), value: stats.todayRevenue.toLocaleString(), change: "+0%", trendingUp: true },
        { label: t("dashboard.stats.week"), value: stats.weekRevenue.toLocaleString(), change: "+0%", trendingUp: true },
        { label: t("dashboard.stats.month"), value: stats.monthRevenue.toLocaleString(), change: "+0%", trendingUp: true },
    ];

    const orderStatuses = [
        { label: t("orders.tabs.pending"), count: stats.pendingOrders, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: t("orders.tabs.completed"), count: stats.completedOrders, icon: CheckCircle2, color: "text-bouteek-green", bg: "bg-bouteek-green/10" },
        { label: "Active", count: stats.activeOrders, icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Cancelled", count: stats.cancelledOrders, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    ];

    return (
        <div className="space-y-10 pb-12">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{t("dashboard.hello_merchant")}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{t("dashboard.subtitle")}</p>
                </div>
                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-bouteek-green transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder={t("dashboard.search_placeholder")}
                        className="w-full bg-card/50 border border-border/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-bouteek-green/20 focus:border-bouteek-green transition-all"
                    />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bouteek-card p-6 bg-bouteek-green text-black border-none">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t("dashboard.revenue_card.total_revenue")}</p>
                        <TrendingUp size={16} className="opacity-70" />
                    </div>
                    <h3 className="text-3xl font-black mt-4">{stats.totalRevenue.toLocaleString()} <span className="text-sm opacity-50 font-bold">XOF</span></h3>
                </motion.div>

                {/* Bouteek Cash */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bouteek-card p-6 border-border/50">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bouteek Cash</p>
                        <Wallet size={16} className="text-bouteek-green" />
                    </div>
                    <h3 className="text-3xl font-black mt-4">{stats.balance.toLocaleString()} <span className="text-sm text-muted-foreground font-bold">XOF</span></h3>
                </motion.div>

                {/* Subscription Plan */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bouteek-card p-6 border-border/50">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan: <span className="text-bouteek-green font-black">{stats.subscription.plan}</span></p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                            <span>{stats.subscription.start_date ? new Date(stats.subscription.start_date).toLocaleDateString() : "N/A"}</span>
                            <span>{stats.subscription.end_date ? new Date(stats.subscription.end_date).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.subscription.percentage}%` }}
                                className="h-full bg-bouteek-green"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>


            {/* Revenue Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bouteek-card p-8 group cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
                                stat.trendingUp ? "bg-bouteek-green/10 text-bouteek-green" : "bg-red-500/10 text-red-500"
                            )}>
                                {stat.trendingUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-3xl font-black mt-4">
                            {stat.value} <span className="text-sm text-muted-foreground font-medium">XOF</span>
                        </p>
                        <div className="mt-6 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: stat.trendingUp ? "70%" : "30%" }}
                                className={cn("h-full", stat.trendingUp ? "bg-bouteek-green" : "bg-red-500")}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Middle Section: Status & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Status Grid */}
                {/* Order & Stock Status Grid */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Activité" : "Activity & Alerts"}</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {orderStatuses.map((status) => (
                            <div key={status.label} className="bouteek-card p-6 flex flex-col items-center justify-center text-center gap-3 group">
                                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", status.bg, status.color)}>
                                    <status.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black">{status.count}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{status.label}</p>
                                </div>
                            </div>
                        ))}
                        {/* Low Stock Alert Card */}
                        <div className={cn(
                            "bouteek-card p-6 flex flex-col items-center justify-center text-center gap-3 group border-2",
                            stats.lowStockCount > 0 ? "border-red-500/50 bg-red-50" : "border-border/50"
                        )}>
                            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stats.lowStockCount > 0 ? "bg-red-500 text-white" : "bg-muted text-muted-foreground")}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className={cn("text-2xl font-black", stats.lowStockCount > 0 ? "text-red-600" : "")}>{stats.lowStockCount}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Low Stock</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Chart Placeholder (to be implemented) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Analytique des Ventes" : "Sales Analytics"}</h3>
                        <div className="flex gap-2">
                            {['14d', '30d', '90d', '1y'].map((r) => (
                                <Button
                                    key={r}
                                    onClick={() => setTimeframe(r)}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "rounded-full text-[10px] font-bold h-8 transition-all",
                                        timeframe === r ? "bg-bouteek-green text-black border-none" : "hover:border-bouteek-green"
                                    )}
                                >
                                    {r.toUpperCase()}
                                </Button>
                            ))}
                        </div>

                    </div>

                    <div className="bouteek-card h-[350px] p-6">
                        <div className="w-full h-full">
                            <DashboardRevenueChart data={chartData} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Fab Plus Button (Mobile) */}
            <Link href="/dashboard/listings/new">
                <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-bouteek-green text-black rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform">
                    <Plus size={28} />
                </button>
            </Link>


            {/* Quick Actions */}
            <section className="space-y-6 text-foreground">
                <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Opérations Rapides" : "Quick Operations"}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: language === 'fr' ? "Nouveau Listing" : "New Listing", icon: Plus, href: "/dashboard/listings/new" },
                        { label: language === 'fr' ? "Voir Commandes" : "View Orders", icon: ShoppingCart, href: "/dashboard/orders" },
                        { label: language === 'fr' ? "Mes Listings" : "My Listings", icon: LayoutGrid, href: "/dashboard/listings" },
                        { label: language === 'fr' ? "Recharger" : "Top-Up Wallet", icon: Wallet, href: "/dashboard/finance" },
                    ].map((action) => (
                        <Link key={action.label} href={action.href}>

                            <Button variant="outline" className="w-full h-auto p-6 rounded-3xl border-border/50 flex flex-col gap-3 hover:border-bouteek-green transition-all group">
                                <div className="p-3 rounded-2xl bg-muted group-hover:bg-bouteek-green/10 group-hover:text-bouteek-green transition-colors">
                                    <action.icon size={24} />
                                </div>
                                <span className="font-bold text-xs uppercase tracking-wider">{action.label}</span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

