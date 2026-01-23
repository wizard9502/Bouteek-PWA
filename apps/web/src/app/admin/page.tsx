"use client";

import { useEffect, useState } from "react";
import {
    DollarSign,
    Users,
    ShoppingBag,
    CreditCard,
    TrendingUp,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    Activity,
    Layers,
    Zap
} from "lucide-react";
import { getAdminKPIs, getSubscriptionDistribution, getRecentMerchants, getRevenueGrowthData } from "@/lib/adminData";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const RevenueGrowthChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.RevenueGrowthChart),
    { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-3xl" /> }
);
const SubscriptionDistributionChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.SubscriptionDistributionChart),
    { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-3xl" /> }
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [recentMerchants, setRecentMerchants] = useState<any[]>([]);
    const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubdomain, setIsSubdomain] = useState(false);

    // Detect subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bouteek.shop";
            setIsSubdomain(hostname === `admin.${rootDomain}` || hostname.startsWith("admin."));
        }
    }, []);

    const getHref = (path: string) => {
        if (isSubdomain) {
            return path === "/admin" ? "/" : path.replace("/admin", "");
        }
        return path;
    };

    useEffect(() => {
        let mounted = true;
        const loadTo = setTimeout(() => {
            if (mounted && isLoading) {
                console.warn("Admin dashboard data load timed out");
                setIsLoading(false);
                toast.error("Dashboard data load timed out - showing partial or empty data");
            }
        }, 15000); // 15s timeout

        async function loadData() {
            try {
                const [kpis, dist, recent, growth] = await Promise.all([
                    getAdminKPIs().catch(e => { console.error("KPI fail", e); return null; }),
                    getSubscriptionDistribution().catch(e => { console.error("Dist fail", e); return []; }),
                    getRecentMerchants().catch(e => { console.error("Recent fail", e); return []; }),
                    getRevenueGrowthData().catch(e => { console.error("Growth fail", e); return []; })
                ]);

                if (mounted) {
                    setStats(kpis || {});
                    setDistribution(dist || []);
                    setRecentMerchants(recent || []);
                    setRevenueGrowth(growth || []);
                }
            } catch (error) {
                console.error("Failed to load admin data", error);
                if (mounted) toast.error("Critical dashboard error");
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    clearTimeout(loadTo);
                }
            }
        }
        loadData();

        return () => {
            mounted = false;
            clearTimeout(loadTo);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <div className="w-12 h-12 border-4 border-bouteek-green/20 border-t-bouteek-green rounded-full animate-spin" />
                <p className="text-bouteek-green font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Console</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Advanced Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-4 border-b border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-bouteek-green animate-pulse" />
                        <span className="text-[10px] font-black text-bouteek-green uppercase tracking-[0.4em]">System Operational</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                        CONSOLE <span className="text-bouteek-green/20 group-hover:text-bouteek-green/40 transition-colors">OVERVIEW</span>
                    </h1>
                    <p className="text-gray-500 font-bold tracking-[0.1em] text-sm uppercase">Platform Core Dynamics & Real-time Metrics</p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                    <Button
                        variant="ghost"
                        className="rounded-full font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-white h-12 px-8"
                        onClick={() => toast.info('Neural filtering in progress')}
                    >
                        <Filter className="mr-2 w-4 h-4 text-bouteek-green" /> Analytics Range
                    </Button>
                    <Button
                        className="rounded-full font-black text-[10px] uppercase tracking-widest bg-bouteek-green text-black hover:bg-white transition-all h-12 px-10 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                        onClick={() => toast.info('Exporting encrypted audit report')}
                    >
                        Export Audit
                    </Button>
                </div>
            </div>

            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: "Net Revenue", value: `${(stats?.totalRevenue || 0).toLocaleString()} XOF`, sub: "+12.5% MOM", icon: Activity, color: "text-bouteek-green" },
                    { label: "Global Sellers", value: stats?.activeMerchants || 0, sub: "+8.2% Growth", icon: Users, color: "text-blue-400" },
                    { label: "Gross Volume", value: `${(stats?.gmv || 0).toLocaleString()} XOF`, sub: "Direct P2P Sales", icon: Zap, color: "text-purple-400" },
                    { label: "Pending Audit", value: stats?.pendingPayouts || 0, sub: "Encrypted Payouts", icon: Shield, color: "text-red-400" }
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-bouteek-green/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Card className="relative h-full bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-bouteek-green/30 p-8 rounded-[2.5rem] transition-all duration-500 backdrop-blur-xl group cursor-default">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{kpi.label}</p>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{kpi.value}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-bouteek-green" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kpi.sub}</span>
                                    </div>
                                </div>
                                <div className={cn("p-4 rounded-2xl bg-black/50 border border-white/5 group-hover:border-bouteek-green/20 group-hover:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all", kpi.color)}>
                                    <kpi.icon size={24} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Neural Insights Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="xl:col-span-2 bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">Revenue Momentum</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">7-Day Oscillating Performance</p>
                        </div>
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-bouteek-green rounded-full shadow-[0_0_8px_#00FF41]" />
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-white/40 rounded-full" />
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Comms</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <RevenueGrowthChart data={revenueGrowth} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group"
                >
                    <div className="relative z-10 h-full flex flex-col">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-wider mb-2">Network Spread</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-12">Tier Saturation Matrix</p>

                        <div className="flex-1 flex items-center justify-center">
                            <SubscriptionDistributionChart data={distribution} />
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-bouteek-green/5 border border-bouteek-green/10 text-center">
                                <p className="text-[10px] font-black text-bouteek-green uppercase tracking-[0.2em]">Peak Optimization Required</p>
                                <p className="text-white font-bold text-xs mt-1">PRO Tier Growth: +22%</p>
                            </div>
                        </div>
                    </div>
                    {/* Background Visualizer */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bouteek-green/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-bouteek-green/20 transition-all duration-700" />
                </motion.div>
            </div>

            {/* Advanced Ledger - Recent Merchants */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">Registry Ledger</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Real-time Entity Onboarding</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="rounded-full font-black text-[10px] uppercase tracking-widest text-bouteek-green hover:bg-bouteek-green hover:text-black transition-all h-12 px-8 border border-bouteek-green/20"
                        onClick={() => window.location.href = getHref('/admin/merchants')}
                    >
                        Access Master Registry <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Node Identifier</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Tier Matrix</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Status</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Sync Date</th>
                                <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentMerchants.map((merchant, idx) => (
                                <tr key={merchant.id} className="group hover:bg-white/[0.03] transition-all">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center font-black text-bouteek-green shadow-inner">
                                                {merchant.business_name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm uppercase tracking-wider">{merchant.business_name}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{merchant.contact_email || 'NODATA@BOUTEEK.CRYPTO'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em]",
                                            merchant.subscription_tier === 'pro' ? "bg-bouteek-green text-black border-bouteek-green shadow-[0_0_10px_rgba(0,255,65,0.2)]" :
                                                merchant.subscription_tier === 'growth' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                    "bg-white/5 text-gray-400 border-white/10"
                                        )}>
                                            {merchant.subscription_tier || 'STARTER'}
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        {merchant.is_verified ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-bouteek-green" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Verified</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 opacity-50">
                                                <div className="w-2 h-2 rounded-full bg-gray-500" />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Awaiting Sync</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-6 px-4 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                                        {new Date(merchant.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl w-10 h-10 hover:bg-bouteek-green hover:text-black hover:rotate-90 transition-all duration-500"
                                        >
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
