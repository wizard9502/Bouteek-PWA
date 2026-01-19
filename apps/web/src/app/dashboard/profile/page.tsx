"use client";


import { useState, useEffect } from "react";
import {
    UserCircle,
    Settings,
    Languages,
    Moon,
    Sun,
    MessageCircle,
    Instagram,
    Twitter,
    Smartphone,
    LogOut,
    ChevronRight,
    MapPin,
    ShieldCheck,
    Star,
    TicketPercent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

export default function ProfilePage() {
    return (
        <TranslationProvider>
            <ProfilePageContent />
        </TranslationProvider>
    );
}

export default function ProfilePage() {
    return (
        <TranslationProvider>
            <ProfilePageContent />
        </TranslationProvider>
    );
}

function ProfilePageContent() {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile"); // profile, referrals

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">{t("profile.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">{t("dashboard.subtitle")}</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-muted p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                        activeTab === "profile" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {t("profile.tabs.profile")}
                </button>
                <button
                    onClick={() => setActiveTab("referrals")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                        activeTab === "referrals" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {t("profile.tabs.referrals")}
                </button>
            </div>

            {activeTab === "profile" ? <ProfileSettings theme={theme} setTheme={setTheme} /> : <ReferralsManager />}
        </div>
    );
}

function ProfileSettings({ theme, setTheme }: { theme: string | undefined, setTheme: (t: string) => void }) {
    const { t, language, setLanguage } = useTranslation();
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState("");
    const [redeemCode, setRedeemCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
            if (data) {
                setMerchant(data);
            }
        }
        setLoading(false);
    };

    const handleRedeemReferral = async () => {
        if (!redeemCode) return;
        setIsRedeeming(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { referral_code_used: redeemCode }
            });
            if (error) throw error;
            alert(language === 'fr' ? "Code de parrainage utilisé avec succès !" : "Referral code redeemed successfully!");
            setRedeemCode("");
        } catch (error) {
            console.error(error);
            alert("Error redeeming code.");
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        alert(language === 'fr' ? "Code promo appliqué !" : "Promo code applied!");
        setPromoCode("");
    };

    const toggleTawk = () => {
        if ((window as any).Tawk_API && (window as any).Tawk_API.maximize) {
            (window as any).Tawk_API.maximize();
        } else {
            alert(language === 'fr' ? "Le chat se charge..." : "Chat is loading...");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme);
        if (merchant) {
            try {
                await supabase
                    .from('merchants')
                    .update({ preferred_theme: newTheme })
                    .eq('id', merchant.id);
            } catch (error) {
                console.error("Error saving theme preference:", error);
            }
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-black rounded-full border-t-transparent" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Merchant Identity Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border/50 rounded-4xl p-8 md:p-12 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-bouteek-green/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-4xl bg-muted overflow-hidden border-4 border-white shadow-2xl">
                            <img
                                src={merchant?.logo_url || "https://images.unsplash.com/photo-1599305090597-fe195caadab8?w=400&h=400&fit=crop"}
                                className="w-full h-full object-cover"
                                alt="Merchant Logo"
                            />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-bouteek-green text-black px-4 py-2 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2">
                            <ShieldCheck size={16} />
                            Verified
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                            <h2 className="text-3xl font-black tracking-tight">{merchant?.business_name || "Merchant Name"}</h2>
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase mx-auto md:mx-0">
                                <Star size={12} strokeWidth={3} />
                                4.9 Rating
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-bold text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-bouteek-green" />
                                Dakar, SENEGAL
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-bouteek-green animate-pulse" />
                                {language === 'fr' ? "En Ligne" : "Online"}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center md:items-start gap-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("profile.trust_score")}</p>
                            <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    className="h-full bg-bouteek-green shadow-[0_0_10px_rgba(0,214,50,0.5)]"
                                />
                            </div>
                            <p className="text-sm font-black text-bouteek-green mt-1">98% {t("profile.platinum_tier")}</p>
                        </div>
                    </div>

                    <Link href="/dashboard/settings">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/50 font-bold hidden md:flex">
                            {t("profile.edit_profile")}
                        </Button>
                    </Link>

                </div>
            </motion.div>

            {/* Main Settings Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Toggles & Preferences */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black tracking-tight">{t("profile.preferences")}</h3>
                    <div className="bouteek-card p-4 space-y-1">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-muted group text-muted-foreground">
                                    <Languages size={20} />
                                </div>
                                <span className="font-bold text-sm">{t("profile.language")}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                                <Button
                                    variant="ghost"
                                    onClick={() => setLanguage('en')}
                                    className={cn("h-8 rounded-lg px-3 text-[10px] font-black uppercase transition-all", language === 'en' ? "bg-white shadow-sm text-black" : "text-muted-foreground")}
                                >
                                    EN
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setLanguage('fr')}
                                    className={cn("h-8 rounded-lg px-3 text-[10px] font-black uppercase transition-all", language === 'fr' ? "bg-white shadow-sm text-black" : "text-muted-foreground")}
                                >
                                    FR
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4 px-4 pt-2">
                                <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                                    <Settings size={20} />
                                </div>
                                <span className="font-black text-sm uppercase tracking-wider">{t("profile.appearance") || "Appearance"}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-2">
                                {[
                                    { id: 'light', name: t('profile.themes.light'), color: 'bg-white', border: 'border-border' },
                                    { id: 'dark', name: t('profile.themes.dark'), color: 'bg-zinc-900', border: 'border-zinc-800' },
                                    { id: 'pink', name: t('profile.themes.pink'), color: 'bg-pink-500', border: 'border-pink-200' },
                                    { id: 'purple', name: t('profile.themes.purple'), color: 'bg-purple-600', border: 'border-purple-200' },
                                    { id: 'ocean', name: t('profile.themes.ocean'), color: 'bg-blue-500', border: 'border-blue-200' },
                                    { id: 'luxury', name: t('profile.themes.luxury'), color: 'bg-zinc-950', border: 'border-amber-500', dot: 'bg-amber-500' },
                                    { id: 'sunset', name: t('profile.themes.sunset'), color: 'bg-orange-500', border: 'border-orange-200' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleThemeChange(t.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200",
                                            theme === t.id ? "border-primary bg-primary/5 scale-105 shadow-sm" : "border-transparent hover:bg-muted/50"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full border shadow-inner flex items-center justify-center relative", t.color, t.border)}>
                                            {theme === t.id && (
                                                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                                    <Smartphone size={20} />
                                </div>
                                <span className="font-bold text-sm">{t("profile.notifications")}</span>
                            </div>
                            <ChevronRight size={18} className="text-muted-foreground group-hover:text-bouteek-green transition-colors" />
                        </div>
                    </div>

                    {/* Promo Code & Redeem Referral */}
                    <div className="space-y-4">
                        <div className="bouteek-card p-6 border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-bouteek-green/10 text-bouteek-green">
                                    <TicketPercent size={20} />
                                </div>
                                <h4 className="font-black text-sm uppercase tracking-wider">{t("profile.redeem_referral")}</h4>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="REF-USER-123"
                                    className="rounded-xl h-11 uppercase"
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                />
                                <Button
                                    className="rounded-xl h-11 bg-black text-white px-6 font-bold"
                                    onClick={handleRedeemReferral}
                                    disabled={isRedeeming || !redeemCode}
                                >
                                    {language === 'fr' ? "Utiliser" : "Redeem"}
                                </Button>
                            </div>
                        </div>

                        <div className="bouteek-card p-6 border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                    <Star size={20} />
                                </div>
                                <h4 className="font-black text-sm uppercase tracking-wider">{t("profile.promo_code")}</h4>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="PROMO2024"
                                    className="rounded-xl h-11 uppercase"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                />
                                <Button
                                    className="rounded-xl h-11 border-border/50 font-bold"
                                    variant="outline"
                                    onClick={handleApplyPromo}
                                    disabled={!promoCode}
                                >
                                    {language === 'fr' ? "Appliquer" : "Apply"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social & Support */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black tracking-tight">{t("profile.social_support")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-6 rounded-3xl border-border/50 flex flex-col gap-3 group">
                            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
                                <Instagram size={24} />
                            </div>
                            <span className="font-bold text-[8px] lg:text-[10px] uppercase tracking-widest">{t("profile.connect_ig")}</span>
                        </Button>
                        <Button variant="outline" className="h-auto p-6 rounded-3xl border-border/50 flex flex-col gap-3 group">
                            <div className="p-3 rounded-2xl bg-black/10 text-black dark:text-white group-hover:scale-110 transition-transform">
                                <Twitter size={24} />
                            </div>
                            <span className="font-bold text-[8px] lg:text-[10px] uppercase tracking-widest">{t("profile.connect_tt")}</span>
                        </Button>
                        <Button variant="outline" className="h-auto p-6 rounded-3xl border-border/50 flex flex-col gap-3 group">
                            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform">
                                <Smartphone size={24} />
                            </div>
                            <span className="font-bold text-[8px] lg:text-[10px] uppercase tracking-widest">{t("profile.connect_sc")}</span>
                        </Button>
                    </div>

                    <div className="bouteek-card p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-bouteek-green/10 flex items-center justify-center text-bouteek-green">
                                <MessageCircle size={28} />
                            </div>
                            <div>
                                <h4 className="font-black">{t("profile.live_chat")}</h4>
                                <p className="text-xs text-muted-foreground font-medium">{t("profile.live_chat_desc")}</p>
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest"
                            onClick={toggleTawk}
                        >
                            {t("profile.start_chat")}
                        </Button>
                    </div>


                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest mt-4"
                    >
                        <LogOut className="mr-2" size={18} />
                        {t("profile.sign_out")}
                    </Button>

                </section>
            </div>
        </div>
    );
}

function ReferralsManager() {
    const { t, language } = useTranslation();
    const [merchant, setMerchant] = useState<any>(null);
    const [stats, setStats] = useState({
        referralCount: 0,
        pendingEarnings: 0,
        totalWithdrawn: 0
    });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [referralCode, setReferralCode] = useState("");
    const [isSavingCode, setIsSavingCode] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: mData } = await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (mData) {
            setMerchant(mData);
            if (mData.referral_code) setReferralCode(mData.referral_code);

            // Fetch referrals (where this merchant's referral code was used)
            const { data: refs, count } = await supabase
                .from('merchants')
                .select('id, business_name, created_at, subscription_tier', { count: 'exact' })
                .eq('referred_by', mData.referral_code);

            if (refs) {
                setReferrals(refs);
                setStats(prev => ({ ...prev, referralCount: count || 0 }));
            }

            // Fetch payout stats
            const { data: payouts } = await supabase
                .from('affiliate_payouts')
                .select('amount, status')
                .eq('referrer_id', mData.id);

            if (payouts) {
                const total = payouts.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.amount : 0), 0);
                const pending = payouts.reduce((acc, curr) => acc + (curr.status === 'pending' ? curr.amount : 0), 0);
                setStats(prev => ({ ...prev, pendingEarnings: pending, totalWithdrawn: total }));
            }
        }
    };

    const handleSaveReferral = async () => {
        if (!merchant) return;
        setIsSavingCode(true);
        try {
            const { error } = await supabase
                .from('merchants')
                .update({ referral_code: referralCode })
                .eq('id', merchant.id);
            if (error) throw error;
            fetchReferralData();
        } catch (error) {
            console.error(error);
            alert("Failed to save referral code. It might be taken.");
        } finally {
            setIsSavingCode(false);
        }
    };

    const copyCode = () => {
        if (!merchant?.referral_code) return;
        navigator.clipboard.writeText(merchant.referral_code);
        // Assuming toast is available or use alert
        alert("Referral code copied!");
    };
    // Lucide icons for ReferralsManager specific
    const { TrendingUp, Copy, Users, Wallet, Gift, Share2, CheckCircle2 } = require("lucide-react");

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Referral Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black text-white rounded-4xl p-8 md:p-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-bouteek-green/20 blur-3xl rounded-full -mr-32 -mt-32" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-bouteek-green/20 text-bouteek-green px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                            <TrendingUp size={14} />
                            {t("profile.referral_hero.grow")}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                            {t("profile.referral_hero.title")} <span className="text-bouteek-green">Bouteek.</span>
                        </h2>

                        <div className="space-y-4">
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t("profile.referral_hero.code_label")}</p>
                            {merchant?.referral_code ? (
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl h-16 flex items-center px-6 font-mono font-black text-2xl tracking-widest">
                                        {merchant.referral_code}
                                    </div>
                                    <Button
                                        onClick={copyCode}
                                        className="h-16 w-16 rounded-2xl bg-bouteek-green text-black hover:scale-105 transition-transform"
                                    >
                                        <Copy size={24} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="MYSTORE123"
                                        className="flex-1 bg-white/10 backdrop-blur-md border-white/10 rounded-2xl h-16 px-6 font-mono font-black text-2xl tracking-widest uppercase text-white placeholder:text-gray-600"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        maxLength={15}
                                    />
                                    <Button
                                        className="h-16 px-8 rounded-2xl bg-bouteek-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        onClick={handleSaveReferral}
                                        disabled={isSavingCode || !referralCode}
                                    >
                                        {isSavingCode ? "..." : t("profile.referral_hero.set_btn")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Users className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black">{stats.referralCount}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("profile.stats.total")}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Wallet className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black text-bouteek-green">{stats.pendingEarnings.toLocaleString()} <span className="text-[10px] text-white">XOF</span></p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("profile.stats.pending")}</p>
                        </div>
                    </div>
            </motion.div>

            {/* List of Referrals */}
            <section className="space-y-6">
                <h3 className="text-xl font-black">{t("profile.table.title")}</h3>
                <div className="bouteek-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t("profile.table.merchant")}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t("profile.table.plan")}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t("profile.table.joined")}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">{t("profile.table.status")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {referrals.length > 0 ? referrals.map((ref) => (
                                <tr key={ref.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold">{ref.business_name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="uppercase text-[10px] font-black px-2 py-1 rounded-full border border-border w-fit">
                                            {ref.subscription_tier || 'Starter'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                        {new Date(ref.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex items-center gap-1 text-bouteek-green font-bold text-[10px] uppercase">
                                            <CheckCircle2 size={12} />
                                            {t("profile.table.active")}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                                        {t("profile.table.empty")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
