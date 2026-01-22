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
    ArrowUpRight
} from "lucide-react";
import { getAdminKPIs, getSubscriptionDistribution, getRecentMerchants, getRevenueGrowthData } from "@/lib/adminData";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const RevenueGrowthChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.RevenueGrowthChart),
    { ssr: false }
);
const SubscriptionDistributionChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.SubscriptionDistributionChart),
    { ssr: false }
);


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [recentMerchants, setRecentMerchants] = useState<any[]>([]);
    const [revenueGrowth, setRevenueGrowth] = useState<any[]>([]);
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
        async function loadData() {
            try {
                const [kpis, dist, recent, growth] = await Promise.all([
                    getAdminKPIs(),
                    getSubscriptionDistribution(),
                    getRecentMerchants(),
                    getRevenueGrowthData()
                ]);
                setStats(kpis);
                setDistribution(dist);
                setRecentMerchants(recent);
                setRevenueGrowth(growth);

            } catch (error) {
                console.error("Failed to load admin data", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500 text-xs font-bold">
                Loading Admin Dashboard...
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 font-medium mt-1">Platform health at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl font-bold"
                        onClick={() => toast.info('Advanced filtering coming soon')}
                    >
                        <Filter className="mr-2 w-4 h-4" /> Filter
                    </Button>
                    <Button
                        className="rounded-xl font-bold bg-black text-white"
                        onClick={() => toast.info('Report download feature coming soon')}
                    >
                        Download Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 font-bold uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-black mt-2 text-gray-900">{stats?.totalRevenue?.toLocaleString()} XOF</h3>
                            <div className="flex items-center gap-1 mt-2 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full text-xs font-bold">
                                <TrendingUp size={12} />
                                +12.5%
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 font-bold uppercase tracking-wider">Active Merchants</p>
                            <h3 className="text-3xl font-black mt-2 text-gray-900">{stats?.activeMerchants}</h3>
                            <div className="flex items-center gap-1 mt-2 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full text-xs font-bold">
                                <TrendingUp size={12} />
                                +8.2%
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 font-bold uppercase tracking-wider">GMV</p>
                            <h3 className="text-3xl font-black mt-2 text-gray-900">{stats?.gmv?.toLocaleString()} XOF</h3>
                            <p className="text-gray-500 text-xs font-bold">Gross Merchandise Value</p>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pending Payouts</p>
                            <h3 className="text-3xl font-black mt-2 text-gray-900">{stats?.pendingPayouts}</h3>
                            <div className="flex items-center gap-1 mt-2 text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-full text-xs font-bold">
                                Needs Action
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                            <CreditCard size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth - Placeholder / Mock Data for visual */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-border/50 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900">Revenue Growth</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="text-xs font-bold text-muted-foreground">Subscriptions</span>
                            <span className="w-3 h-3 bg-emerald-500 rounded-full ml-2" />
                            <span className="text-xs font-bold text-muted-foreground">Commissions</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full p-2">
                        <RevenueGrowthChart data={revenueGrowth.length ? revenueGrowth : []} />
                    </div>

                </div>

                {/* Subscription Dist */}
                <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-8">User Distribution</h3>
                    <div className="h-[300px] w-full relative flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl">
                        <p className="text-gray-400 font-bold">Pie Chart Disabled</p>
                    </div>
                    <div className="mt-4 text-center text-xs text-muted-foreground">
                        Distribution across subscription tiers
                    </div>
                </div>
            </div>

            {/* Recent Merchants Table */}
            <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900">Recent Merchants</h3>
                    <Button
                        variant="ghost"
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                        onClick={() => window.location.href = getHref('/admin/merchants')}
                    >
                        View All <ArrowUpRight className="ml-1 w-4 h-4" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="text-left py-4 px-4 text-gray-600 font-black uppercase tracking-wider">Business</th>
                                <th className="text-left py-4 px-4 text-gray-600 font-black uppercase tracking-wider">Plan</th>
                                <th className="text-left py-4 px-4 text-gray-600 font-black uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-4 text-gray-600 font-black uppercase tracking-wider">Joined</th>
                                <th className="text-right py-4 px-4 text-gray-600 font-black uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentMerchants.map((merchant) => (
                                <tr key={merchant.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{merchant.business_name}</p>
                                            <p className="text-xs text-muted-foreground">{merchant.contact_email || 'No email'}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "uppercase text-[10px] font-black px-2 py-1 rounded-full border",
                                            merchant.subscription_tier === 'pro' ? "bg-black text-white border-black" :
                                                merchant.subscription_tier === 'growth' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                    "bg-gray-100 text-gray-600 border-gray-200"
                                        )}>
                                            {merchant.subscription_tier || 'starter'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {merchant.is_verified ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-600">
                                        {new Date(merchant.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl"
                                            onClick={() => toast.info('Merchant actions menu coming soon')}
                                        >
                                            <MoreHorizontal size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
