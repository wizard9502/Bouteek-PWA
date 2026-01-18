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

function ProfilePageContent() {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [referralCode, setReferralCode] = useState("");
    const [promoCode, setPromoCode] = useState("");
    const [redeemCode, setRedeemCode] = useState("");
    const [isSavingCode, setIsSavingCode] = useState(false);
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
                if (data.referral_code) setReferralCode(data.referral_code);
            }
        }
        setLoading(false);
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
            // Refresh
            fetchProfile();
        } catch (error) {
            console.error(error);
            alert("Failed to save referral code. It might be taken.");
        } finally {
            setIsSavingCode(false);
        }
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

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-black rounded-full border-t-transparent" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">{t("profile.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">{t("dashboard.subtitle")}</p>
            </div>


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

                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <span className="font-bold text-sm">{t("profile.dark_mode")}</span>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
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


                    {/* Referral Section */}
                    <div className="bouteek-card p-8 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <TicketPercent className="text-purple-600" size={24} />
                            <h4 className="font-black text-purple-950 dark:text-purple-100">{t("profile.referral_title")}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{t("profile.referral_desc")}</p>

                        {merchant?.referral_code ? (
                            <div className="flex gap-2">
                                <div className="flex-1 bg-background border rounded-xl flex items-center px-4 font-mono font-bold">
                                    {merchant.referral_code}
                                </div>
                                <Button className="rounded-xl h-11 px-6 bg-purple-600 text-white font-bold" onClick={() => navigator.clipboard.writeText(merchant.referral_code)}>
                                    {language === 'fr' ? "Copier" : "Copy"}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="MYSTORE123"
                                    className="rounded-xl bg-background border-border/50 h-11 uppercase"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                    maxLength={15}
                                />
                                <Button
                                    className="rounded-xl h-11 px-6 bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-purple-600/20"
                                    onClick={handleSaveReferral}
                                    disabled={isSavingCode || !referralCode}
                                >
                                    {isSavingCode ? (language === 'fr' ? "Enregistrement..." : "Saving...") : (language === 'fr' ? "Définir Code" : "Set Code")}
                                </Button>
                            </div>
                        )}
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
                                <Music size={24} />
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
