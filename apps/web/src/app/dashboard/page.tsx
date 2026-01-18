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

export default function DashboardHome() {
    return (
        <TranslationProvider>
            <DashboardHomeContent />
        </TranslationProvider>
    );
}

function DashboardHomeContent() {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        balance: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase.from('merchants').select('id, bouteek_cash_balance').eq('user_id', user.id).single();
        if (!merchant) return;

        // Fetch Orders for stats
        const { data: orders } = await supabase
            .from('orders')
            .select('status, total, created_at')
            .eq('merchant_id', merchant.id);

        let today = 0, week = 0, month = 0, total = 0;
        let pending = 0, completed = 0, active = 0, cancelled = 0;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        orders?.forEach(order => {
            const amount = order.total || 0;
            const date = new Date(order.created_at);

            if (order.status === 'paid' || order.status === 'completed') {
                total += amount;
                if (date >= startOfDay) today += amount;
                if (date >= startOfWeek) week += amount;
                if (date >= startOfMonth) month += amount;
            }

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
            balance: merchant.bouteek_cash_balance
        });
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

            {/* Total Revenue Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-bouteek-green rounded-4xl -z-10 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="bg-bouteek-green p-8 md:p-12 rounded-4xl text-black relative z-10 shadow-2xl shadow-bouteek-green/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest opacity-70">{t("dashboard.revenue_card.total_revenue")}</p>
                            <h2 className="text-5xl md:text-7xl font-black mt-2 tracking-tighter">
                                {stats.totalRevenue.toLocaleString()} <span className="text-2xl md:text-3xl opacity-50">XOF</span>
                            </h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl">
                            <ArrowUpRight size={32} />
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4 md:gap-8">
                        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/10">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{t("dashboard.revenue_card.balance")}</p>
                            <p className="text-xl font-black">{stats.balance.toLocaleString()} XOF</p>
                        </div>
                        <Link href="/dashboard/finance" className="bg-black text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95">
                            {t("dashboard.revenue_card.withdraw")}
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </motion.div>

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
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-black tracking-tight">Order Activity</h3>
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
                    </div>
                </div>

                {/* Analytics Chart Placeholder (to be implemented) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight">Sales Analytics</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold h-8">7D</Button>
                            <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold h-8 bg-bouteek-green text-white border-none">30D</Button>
                        </div>
                    </div>
                    <div className="bouteek-card h-[320px] p-8 flex flex-col justify-end">
                        {/* Custom SVG Mini-chart */}
                        <div className="flex items-end justify-between gap-2 h-full">
                            {[40, 60, 45, 90, 65, 80, 50, 70, 95, 85, 60, 75].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05 + 0.5, duration: 1 }}
                                    className="flex-1 bg-muted group relative cursor-pointer"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-bouteek-green opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {h * 10}k XOF
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6 px-1">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <span key={m} className="text-[10px] font-bold text-muted-foreground uppercase">{m}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <section className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">Quick Operations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "New Product", icon: Plus, href: "/dashboard/store/new" },
                        { label: "View Orders", icon: ShoppingCart, href: "/dashboard/orders" },
                        { label: "Store Settings", icon: LayoutGrid, href: "/dashboard/store/builder" },
                        { label: "Top-Up Wallet", icon: Wallet, href: "/dashboard/finance" },
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

