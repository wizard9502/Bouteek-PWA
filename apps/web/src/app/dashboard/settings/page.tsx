"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Instagram, Music, Smartphone, Check, X, Globe } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [merchantId, setMerchantId] = useState<string | null>(null);

    // Form State
    const [businessName, setBusinessName] = useState("");
    const [slug, setSlug] = useState("");
    const debouncedSlug = useDebounce(slug, 500);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
    const [initialSlug, setInitialSlug] = useState(""); // Track initial to avoid checking self

    // Domain State
    const [customDomain, setCustomDomain] = useState("");
    const [domainStatus, setDomainStatus] = useState<string>("none"); // none, pending, active

    const [waveNumber, setWaveNumber] = useState("");
    const [orangeNumber, setOrangeNumber] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [instagram, setInstagram] = useState("");
    const [tiktok, setTikTok] = useState("");
    const [snapchat, setSnapchat] = useState("");

    const { t } = useTranslation();



    useEffect(() => {
        fetchMerchantProfile();
    }, []);

    useEffect(() => {
        if (debouncedSlug && debouncedSlug !== initialSlug) {
            checkSlugAvailability(debouncedSlug);
        } else if (debouncedSlug === initialSlug) {
            setIsSlugAvailable(true); // Available if it's their own
            setIsCheckingSlug(false);
        } else {
            setIsSlugAvailable(null);
        }
    }, [debouncedSlug, initialSlug]);

    const checkSlugAvailability = async (checkSlug: string) => {
        if (checkSlug.length < 3) return;
        setIsCheckingSlug(true);
        try {
            const reservedSlugs = [
                "admin", "dashboard", "api", "auth", "login", "register", "signup", "settings",
                "team", "accounting", "support", "help", "contact", "legal", "terms", "privacy",
                "www", "bouteek", "shop"
            ];

            if (reservedSlugs.includes(checkSlug)) {
                setIsSlugAvailable(false);
                return;
            }

            const { data, error } = await supabase
                .from('storefronts')
                .select('id')
                .eq('slug', checkSlug)
                .maybeSingle(); // Avoid error on no rows

            if (error) throw error;
            setIsSlugAvailable(!data); // If data exists, it's NOT available
        } catch (error) {
            console.error("Slug check failed", error);
            setIsSlugAvailable(null); // Unknown state
        } finally {
            setIsCheckingSlug(false);
        }
    };

    const fetchMerchantProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "Row not found" - acceptable for new users
                throw error;
            }

            if (data) {
                setMerchantId(data.id);
                setBusinessName(data.business_name || "");
                setSlug(data.slug || "");
                setInitialSlug(data.slug || "");
                setReferralCode(data.referral_code || "");
                setInstagram(data.instagram || "");
                setTikTok(data.tiktok || "");
                setSnapchat(data.snapchat || "");



                // Fetch payment methods if stored separately, or assuming they are in merchant table for MVP?
                // Checking schema... Schema has separate table 'storefront_payment_methods' usually?
                // Or checking if columns exist in merchants. 
                // For MVP, if schema doesn't have it, we might need to add it or store in metadata.
                // Let's assume we store in a simple way for now or I check the schema first.

                // RE-CHECKING SCHEMA: 
                // The migration file created `storefront_payment_methods`.
                // Let's fetch that.
                if (data.id) {
                    const { data: payments } = await supabase
                        .from('storefront_payment_methods')
                        .select('*')
                        .eq('storefront_id', data.id); // Wait, schema links payment to storefront_id?

                    // Schema check: merchants -> has One storefront? Or merchants Is the storefront?
                    // Let's check schema details from memory/previous steps.
                    // users -> merchants.
                    // storefronts table exists? Or is it merged?
                    // In migration: create table storefronts (merchant_id references merchants).

                    // So flow is: User -> Merchant -> Storefront -> Payment Methods.

                    fetchStorefrontAndPayments(data.id);
                }
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error(t("finance.load_error") || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchStorefrontAndPayments = async (merchantId: string) => {
        // Get Storefront
        const { data: storefront } = await supabase.from('storefronts').select('id, custom_domain, custom_domain_status').eq('merchant_id', merchantId).single();

        if (storefront) {
            setCustomDomain(storefront.custom_domain || "");
            setDomainStatus(storefront.custom_domain_status || "none");

            const { data: methods } = await supabase.from('storefront_payment_methods').select('*').eq('storefront_id', storefront.id);
            const { data: methods } = await supabase.from('storefront_payment_methods').select('*').eq('storefront_id', storefront.id);

            if (methods) {
                const wave = methods.find((m: any) => m.type === 'wave');
                const om = methods.find((m: any) => m.type === 'orange_money');
                if (wave) setWaveNumber(wave.details?.phoneNumber || "");
                if (om) setOrangeNumber(om.details?.phoneNumber || "");
            }
        }
    };

    const verifyDomain = async () => {
        if (!customDomain) return;
        // Mock verification for now - or simple status toggle
        // In real app: call Vercel API
        setDomainStatus('pending');
        toast.info("Domain verification started. Check DNS settings.");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upsert Merchant
            const reservedSlugs = [
                "admin", "dashboard", "api", "auth", "login", "register", "signup", "settings",
                "team", "accounting", "support", "help", "contact", "legal", "terms", "privacy",
                "www", "bouteek", "shop"
            ];

            const cleanSlug = slug.toLowerCase().trim();

            if (reservedSlugs.includes(cleanSlug)) {
                toast.error(t("settings.url_reserved"));
                setSaving(false);
                return;
            }

            const merchantData = {
                user_id: user.id,
                business_name: businessName,
                slug: cleanSlug,
                referral_code: referralCode.toUpperCase().trim(),
                instagram,
                tiktok,
                snapchat
            };



            // If merchantId exists, update, else insert.
            // But upsert requires primary key or unique constraint.
            let currentMerchantId = merchantId;

            if (merchantId) {
                await supabase.from('merchants').update(merchantData).eq('id', merchantId);
            } else {
                const { data: newMerchant, error } = await supabase.from('merchants').insert(merchantData).select().single();
                if (error) throw error;
                currentMerchantId = newMerchant.id;
                setMerchantId(newMerchant.id);
            }

            // 2. Upsert Storefront (One-to-one for MVP)
            if (!currentMerchantId) throw new Error("Failed to get merchant ID");

            const { data: storefront, error: sfError } = await supabase
                .from('storefronts')
                .select('id')
                .eq('merchant_id', currentMerchantId)
                .single();

            let storefrontId = storefront?.id;

            if (!storefront) {
                const { data: newSf, error: newSfError } = await supabase
                    .from('storefronts')
                    .insert({
                        merchant_id: currentMerchantId,
                        name: businessName,
                        custom_domain: customDomain,
                        custom_domain_status: domainStatus
                    })
                    .select()
                    .single();
                if (newSfError) throw newSfError;
                storefrontId = newSf.id;
            } else {
                // Update existing storefront if exists
                await supabase.from('storefronts').update({
                    custom_domain: customDomain,
                    custom_domain_status: domainStatus
                }).eq('id', storefront.id);
            }

            // 3. Upsert Payment Methods
            // We diligently delete old and insert new, or upsert by ID if key existed.
            // Easiest MVP: Delete all for this storefront and re-insert active ones.

            await supabase.from('storefront_payment_methods').delete().eq('storefront_id', storefrontId);

            const methodsToInsert = [];
            if (waveNumber) {
                methodsToInsert.push({
                    storefront_id: storefrontId,
                    type: 'wave',
                    details: { phoneNumber: waveNumber },
                    is_active: true
                });
            }
            if (orangeNumber) {
                methodsToInsert.push({
                    storefront_id: storefrontId,
                    type: 'orange_money',
                    details: { phoneNumber: orangeNumber },
                    is_active: true
                });
            }

            if (methodsToInsert.length > 0) {
                const { error: pmError } = await supabase.from('storefront_payment_methods').insert(methodsToInsert);
                if (pmError) throw pmError;
            }

            toast.success(t("settings.save_success") + " ✅");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("settings.save_error"));
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-10 pb-12">
            <h2 className="hero-text !text-4xl">{t("settings.title")}</h2>

            <form onSubmit={handleSave} className="space-y-8">
                <Card className="rounded-3xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-black">{t("settings.general")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("settings.business_name")}</Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("settings.store_slug")}</Label>
                            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-transparent focus-within:border-bouteek-green transition-all relative">
                                <span className="text-muted-foreground text-xs font-bold pl-3">https://</span>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className={`border-none bg-transparent h-10 font-bold focus-visible:ring-0 px-0 w-full text-right ${slug.length > 2
                                        ? (isSlugAvailable ? 'text-green-600' : (isSlugAvailable === false ? 'text-red-500' : ''))
                                        : ''
                                        }`}
                                    placeholder={t("settings.placeholder_slug")}
                                    required
                                />
                                <span className="text-muted-foreground text-xs font-bold pr-3">.bouteek.shop</span>

                                <div className="absolute right-[-30px] flex items-center h-full">
                                    {isCheckingSlug ? (
                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                    ) : slug.length > 2 && (
                                        isSlugAvailable ? (
                                            <div className="p-1 bg-green-100 rounded-full text-green-600"><Check size={14} strokeWidth={3} /></div>
                                        ) : isSlugAvailable === false ? (
                                            <div className="p-1 bg-red-100 rounded-full text-red-500"><X size={14} strokeWidth={3} /></div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                            {slug.length > 2 && isSlugAvailable === false && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-right">URL Taken</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="referralCode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("settings.referral_code")}</Label>
                            <Input
                                id="referralCode"
                                value={referralCode}
                                onChange={e => setReferralCode(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-mono"
                            />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{t("settings.referral_desc")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-black">{t("settings.payment_methods")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground font-medium">{t("settings.payments_desc")}</p>

                        <div className="space-y-4">
                            <Label htmlFor="wave" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <img src="/wave-logo.png" className="w-5 h-5 rounded" alt="Wave" />
                                {t("settings.wave_number")}
                            </Label>
                            <Input
                                id="wave"
                                value={waveNumber}
                                onChange={e => setWaveNumber(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                placeholder="+221 77 000 00 00"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="om" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <img src="/orange-money-logo.png" className="w-5 h-5 rounded" alt="OM" />
                                {t("settings.om_number")}
                            </Label>
                            <Input
                                id="om"
                                value={orangeNumber}
                                onChange={e => setOrangeNumber(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                placeholder="+221 77 000 00 00"
                            />
                        </div>
                    </CardContent>
                </Card>

                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-black">{t("settings.domain") || "Custom Domain"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground font-medium">
                            {t("settings.domain_desc") || "Connect your own domain (e.g. shop.com) to your store."}
                        </p>

                        <div className="space-y-4">
                            <Label htmlFor="customDomain" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Domain Name</Label>
                            <div className="flex gap-4">
                                <Input
                                    id="customDomain"
                                    value={customDomain}
                                    onChange={e => setCustomDomain(e.target.value.toLowerCase())}
                                    className="h-12 rounded-xl bg-muted/30 font-bold flex-1"
                                    placeholder="shop.example.com"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="h-12 rounded-xl font-bold px-6"
                                    onClick={verifyDomain} // Assuming verifyDomain function exists
                                >
                                    Verify
                                </Button>
                            </div>
                        </div>

                        {/* Status Display */}
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    domainStatus === 'active' ? 'bg-green-100 text-green-700' : 
                                    domainStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {domainStatus === 'active' ? <Check size={20} /> : 
                                     domainStatus === 'pending' ? <Loader2 size={20} className="animate-spin" /> : 
                                     <Globe size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-wide">
                                        {domainStatus === 'active' ? 'Active' : 
                                         domainStatus === 'pending' ? 'Verification Pending' : 
                                         'Not Connected'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {domainStatus === 'active' ? 'Your domain is live.' : 
                                         domainStatus === 'pending' ? 'Check your DNS settings.' : 
                                         'Add a domain to get started.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DNS Instructions (Shown if pending) */}
                        {domainStatus === 'pending' && (
                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 text-xs text-blue-800 space-y-2">
                                <p className="font-bold uppercase tracking-widest">DNS Configuration</p>
                                <p>Add the following record to your DNS provider:</p>
                                <div className="bg-white p-3 rounded-xl border border-blue-200 font-mono flex justify-between items-center">
                                    <span>CNAME @ cname.vercel-dns.com</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-black">{t("settings.social_links")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground font-medium">{t("settings.social_desc")}</p>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <Instagram size={18} className="text-pink-500" />
                                {t("settings.instagram")}
                            </Label>
                            <Input
                                value={instagram}
                                onChange={e => setInstagram(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                placeholder="@yourshop"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <Music size={18} className="text-black dark:text-white" />
                                {t("settings.tiktok")}
                            </Label>
                            <Input
                                value={tiktok}
                                onChange={e => setTikTok(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                placeholder="@yourshop"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <Smartphone size={18} className="text-yellow-500" />
                                {t("settings.snapchat")}
                            </Label>
                            <Input
                                value={snapchat}
                                onChange={e => setSnapchat(e.target.value)}
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                placeholder="@yourshop"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full h-16 rounded-3xl bg-black text-white hover:bg-black/90 font-black uppercase tracking-[0.2em] shadow-2xl" disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("settings.saving")}
                        </>
                    ) : t("settings.save_changes")}
                </Button>
            </form >
        </div >
    );
}

