"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard, Store, ShoppingCart, Wallet, UserCircle,
    TrendingUp, TrendingDown, Plus, Search, Bell, Moon, Sun,
    Home, Package, Tag, Users, Settings, Smartphone, Monitor
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const DashboardRevenueChart = dynamic(
    () => import("@/components/admin/AnalyticsCharts").then((mod) => mod.DashboardRevenueChart),
    { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-xl" /> }
);

const MOCK_DATA = {
    business_name: "Le Chic Boutique",
    balance: 1250500,
    total_revenue: 4580000,
    orders: {
        pending: 5,
        completed: 142,
        active: 12,
        total: 159
    },
    growth: 24.5,
    chart_data: [
        { name: "Lun", revenue: 45000 },
        { name: "Mar", revenue: 52000 },
        { name: "Mer", revenue: 38000 },
        { name: "Jeu", revenue: 65000 },
        { name: "Ven", revenue: 89000 },
        { name: "Sam", revenue: 120000 },
        { name: "Dim", revenue: 95000 },
    ]
};

export default function ShowcaseGenerator() {
    const [view, setView] = useState<'web' | 'mobile'>('web');
    const [tab, setTab] = useState('dashboard');

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-10 flex flex-col items-center gap-10">
            <div className="flex gap-4 mb-10">
                <Button variant={view === 'web' ? 'default' : 'outline'} onClick={() => setView('web')}>
                    <Monitor className="mr-2" /> Web View
                </Button>
                <Button variant={view === 'mobile' ? 'default' : 'outline'} onClick={() => setView('mobile')}>
                    <Smartphone className="mr-2" /> Mobile View
                </Button>
            </div>

            <div className="flex gap-4 mb-10 overflow-x-auto max-w-full">
                {['dashboard', 'orders', 'store', 'finance', 'referrals'].map(t => (
                    <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
                        {t.toUpperCase()}
                    </Button>
                ))}
            </div>

            <div className={view === 'web' ? "w-[1200px] h-[800px] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl bg-zinc-950" : "w-[375px] h-[812px] border-8 border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-950 relative"} id={view === 'web' ? "web-mockup" : "mobile-mockup"}>
                {view === 'web' ? <WebView tab={tab} /> : <MobileView tab={tab} />}
            </div>
        </div>
    );
}

function WebView({ tab }: { tab: string }) {
    return (
        <div className="flex h-full text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-8 bg-black">
                <div className="flex items-center gap-3">
                    <img src="/bouteek-logo.jpg" className="w-10 h-10 rounded-xl" />
                    <span className="font-black text-xl">Bouteek</span>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavItem icon={Home} label="Tableau de Bord" active={tab === 'dashboard'} />
                    <NavItem icon={Store} label="Ma Boutique" active={tab === 'store'} />
                    <NavItem icon={ShoppingCart} label="Commandes" active={tab === 'orders'} />
                    <NavItem icon={Wallet} label="Finance" active={tab === 'finance'} />
                    <NavItem icon={Users} label="Parrainage" active={tab === 'referrals'} />
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                {tab === 'dashboard' && <DashboardContent />}
                {tab === 'orders' && <OrdersContent />}
                {tab === 'store' && <StoreContent />}
                {tab === 'finance' && <FinanceContent />}
                {tab === 'referrals' && <ReferralContent />}
            </main>
        </div>
    );
}

function MobileView({ tab }: { tab: string }) {
    return (
        <div className="h-full flex flex-col bg-zinc-950">
            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-zinc-800">
                <span className="font-black text-lg">Bouteek</span>
                <Bell size={20} />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {tab === 'dashboard' && <DashboardContent mobile />}
                {tab === 'orders' && <OrdersContent mobile />}
                {tab === 'store' && <StoreContent mobile />}
                {tab === 'finance' && <FinanceContent mobile />}
                {tab === 'referrals' && <ReferralContent mobile />}
            </div>

            {/* Tab Bar */}
            <nav className="absolute bottom-4 left-4 right-4 h-16 bg-zinc-900/90 backdrop-blur rounded-2xl flex justify-around items-center border border-zinc-800">
                <Store size={22} className={tab === 'store' ? "text-[#00FF41]" : "text-zinc-500"} />
                <ShoppingCart size={22} className={tab === 'orders' ? "text-[#00FF41]" : "text-zinc-500"} />
                <Home size={28} className={tab === 'dashboard' ? "text-[#00FF41]" : "text-zinc-500"} />
                <Wallet size={22} className={tab === 'finance' ? "text-[#00FF41]" : "text-zinc-500"} />
                <UserCircle size={22} className={tab === 'profile' ? "text-[#00FF41]" : "text-zinc-500"} />
            </nav>
        </div>
    );
}

function NavItem({ icon: Icon, label, active }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-[#00FF41] text-black font-bold" : "text-zinc-500 hover:bg-zinc-900"}`}>
            <Icon size={20} />
            <span className="text-sm">{label}</span>
        </div>
    );
}

function DashboardContent({ mobile }: { mobile?: boolean }) {
    return (
        <div className="space-y-6">
            <div className={mobile ? "space-y-4" : "flex justify-between items-end mb-8"}>
                <div>
                    <h1 className="text-3xl font-black">Bonjour, {MOCK_DATA.business_name}!</h1>
                    <p className="text-zinc-500">Voici vos performances d'aujourd'hui.</p>
                </div>
                {!mobile && (
                    <div className="relative group w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input type="text" placeholder="Rechercher..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-12 pr-4 focus:outline-none" />
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 ${mobile ? "" : "md:grid-cols-3"} gap-4`}>
                <KpiCard label="Revenu Total" value={`${MOCK_DATA.total_revenue.toLocaleString()} XOF`} sub="Ventes globales" primary />
                <KpiCard label="Bouteek Cash" value={`${MOCK_DATA.balance.toLocaleString()} XOF`} sub="Solde disponible" />
                <KpiCard label="Commandes" value={MOCK_DATA.orders.total.toString()} sub="+12 aujourd'hui" />
            </div>

            <div className={`grid grid-cols-1 ${mobile ? "" : "lg:grid-cols-3"} gap-6`}>
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-[250px] md:h-[350px]">
                    <h3 className="font-bold mb-4">Analyse des Ventes</h3>
                    <div className="h-full w-full pb-8">
                        <DashboardRevenueChart data={MOCK_DATA.chart_data} />
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="font-bold mb-4">Activités Récentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                                <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41]">
                                    <ShoppingCart size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Nouvelle Commande #123{i}</p>
                                    <p className="text-xs text-zinc-500">Il y a {i * 10} min • 25,000 XOF</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, sub, primary }: any) {
    return (
        <Card className={`p-6 rounded-3xl border-zinc-800 ${primary ? "bg-[#00FF41] text-black" : "bg-zinc-900 text-white"}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
            <h2 className="text-3xl font-black">{value}</h2>
            <p className="text-xs mt-2 opacity-60">{sub}</p>
        </Card>
    );
}

function OrdersContent({ mobile }: { mobile?: boolean }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">Commandes</h1>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold">#{1000 + i}</div>
                            <div>
                                <p className="font-bold">Client Premium {i}</p>
                                <p className="text-xs text-zinc-500">2 Articles • Livraison Dakar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black">{(15000 * i).toLocaleString()} F</p>
                            <span className="text-[10px] bg-[#00FF41]/10 text-[#00FF41] px-2 py-1 rounded-full font-bold">COMPLÉTÉ</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StoreContent({ mobile }: { mobile?: boolean }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">Ma Boutique</h1>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41]">
                        <Package size={32} />
                    </div>
                    <span className="font-bold">Listings</span>
                    <p className="text-xs text-zinc-500">Gérer vos produits et services</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Settings size={32} />
                    </div>
                    <span className="font-bold">Paramètres</span>
                    <p className="text-xs text-zinc-500">Éditer l'apparence et SEO</p>
                </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
                <div>
                    <h4 className="font-bold">Thème Premium</h4>
                    <p className="text-sm text-zinc-500">Le thème "Midnight Luxury" est actif.</p>
                </div>
                <Button size="sm" className="bg-[#00FF41] text-black font-bold">Changer</Button>
            </div>
        </div>
    );
}

function FinanceContent({ mobile }: { mobile?: boolean }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">Finance</h1>
            <Card className="bg-[#00FF41] text-black p-8 rounded-[2.5rem] border-none">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Solde Bouteek Cash</p>
                <h2 className="text-5xl font-black mt-2">1,250,500 <span className="text-xl">XOF</span></h2>
                <div className="flex gap-4 mt-8">
                    <Button variant="outline" className="bg-black/10 border-black/20 text-black font-bold flex-1">Retirer</Button>
                    <Button className="bg-white text-black font-bold flex-1">Recharger</Button>
                </div>
            </Card>
            <div className="space-y-4">
                <h3 className="font-bold">Transactions Récentes</h3>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                            <ArrowUpRight className="text-[#00FF41]" />
                            <div>
                                <p className="font-bold">Recharge Wave</p>
                                <p className="text-xs text-zinc-500">Hier à 14:30</p>
                            </div>
                        </div>
                        <p className="font-black text-[#00FF41]">+50,000</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReferralContent({ mobile }: { mobile?: boolean }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">Parrainage</h1>
            <div className="bg-zinc-900 border-2 border-dashed border-zinc-800 p-10 rounded-[3rem] text-center space-y-4">
                <div className="w-20 h-20 bg-[#00FF41]/10 text-[#00FF41] rounded-full flex items-center justify-center mx-auto">
                    <Users size={40} />
                </div>
                <h2 className="text-2xl font-black">Gagnez 20% à Vie</h2>
                <p className="text-zinc-500 max-w-sm mx-auto">Invitez d'autres marchands et recevez une commission sur tous leurs frais d'abonnement.</p>
                <div className="bg-black p-4 rounded-2xl font-mono text-[#00FF41] tracking-widest flex justify-between items-center">
                    <span>BOUTEEK-LUXE-2026</span>
                    <Button variant="ghost" size="sm" className="text-[#00FF41] p-0 h-auto">Copier</Button>
                </div>
            </div>
        </div>
    );
}

function ArrowUpRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </svg>
    )
}
