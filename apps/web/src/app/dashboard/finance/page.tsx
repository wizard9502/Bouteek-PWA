"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/contexts/TranslationContext";
import {
    Plus,
    Wallet,
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    ShieldCheck,
    ArrowRight,
    CreditCard,
    Bell,
    Check,
    Loader2,
    Zap,
    Shield,
    Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SubscriptionOptimizer } from "@/components/dashboard/SubscriptionOptimizer";

export default function FinancePage() {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState("overview"); // overview, subscription
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            const { data } = await supabase.from('plans').select('*').order('price', { ascending: true });
            if (data) setPlans(data);
        };
        fetchPlans();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{t("sidebar.billing") || "Billing & Subscriptions"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {language === 'fr' ? "Gérez vos finances et votre abonnement." : "Manage your finances and subscription."}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-muted p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                        activeTab === "overview" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {t("finance.tabs.overview")}
                </button>
                <button
                    onClick={() => setActiveTab("subscription")}
                    className={cn(
                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                        activeTab === "subscription" ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {t("finance.tabs.subscription")}
                </button>
            </div>

            {activeTab === "overview" ? <FinanceOverview /> : <SubscriptionManager plans={plans} />}
        </div>
    );
}

function FinanceOverview() {
    const { t, language } = useTranslation();
    const [amount, setAmount] = useState("");
    const [waveTransactionId, setWaveTransactionId] = useState("");
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);
    const [merchant, setMerchant] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFinanceData();
    }, [showAllTransactions]);

    const fetchFinanceData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchantData } = await supabase.from('merchants').select('id, bouteek_cash_balance, is_restricted').eq('user_id', user.id).single();
        if (merchantData) {
            setMerchant(merchantData);
            setBalance(merchantData.bouteek_cash_balance);
            setIsRestricted(merchantData.is_restricted || false);

            const { data: txs } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('merchant_id', merchantData.id)
                .order('created_at', { ascending: false })
                .limit(showAllTransactions ? 100 : 10);

            if (txs) {
                setTransactions(txs.map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    label: tx.description,
                    date: new Date(tx.created_at).toLocaleDateString(),
                    amount: tx.amount,
                    status: tx.verification_status || "completed",
                    trendingUp: tx.amount > 0
                })));
            }
        }
    };

    const pressKey = (key: string) => {
        if (key === "back") {
            setAmount(prev => prev.slice(0, -1));
        } else if (amount.length < 8) {
            setAmount(prev => prev + key);
        }
    };

    // Wave payment link
    const wavePaymentLink = `https://pay.wave.com/m/M_sn__dJJVmYlh4yk/c/sn/?amount=${amount || 0}`;

    const handleTopUp = async () => {
        if (!amount || Number(amount) < 100) {
            toast.error(language === 'fr' ? "Minimum 100 XOF" : "Minimum top-up is 100 XOF");
            return;
        }

        if (!waveTransactionId || waveTransactionId.length !== 17) {
            toast.error(language === 'fr' ? "ID Transaction Wave invalide (17 caractères)" : "Invalid Wave Transaction ID (17 characters required)");
            return;
        }

        if (!merchant) {
            toast.error("Merchant not found");
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('topup_with_wave', {
                p_merchant_id: merchant.id,
                p_amount: Number(amount),
                p_wave_tx_id: waveTransactionId.toUpperCase()
            });

            if (error) throw error;

            if (data.success) {
                toast.success(data.message);
                setAmount("");
                setWaveTransactionId("");
                setShowTopUpModal(false);
                fetchFinanceData(); // Refresh balance
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            console.error("Top-up Error:", error);
            toast.error(error.message || "Top-up failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Left Side: Wallet Card & Top-up */}
            <div className="lg:col-span-2 space-y-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border/50 rounded-4xl p-10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-bouteek-green/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-bouteek-green/10 transition-colors" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-3xl bg-bouteek-green/10 flex items-center justify-center text-bouteek-green mb-6">
                            <Wallet size={32} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("finance.available_balance")}</p>
                        <h2 className="text-6xl md:text-8xl font-black mt-4 tracking-tighter">
                            {Number(balance).toLocaleString()} <span className="text-2xl md:text-3xl text-muted-foreground font-medium tracking-normal">XOF</span>
                        </h2>

                        <div className="flex gap-4 mt-12 w-full max-w-sm">
                            <Button
                                variant="outline"
                                className="w-full rounded-2xl h-14 font-bold border-border/50"
                                onClick={() => toast.info(language === 'fr' ? 'Analytiques détaillées bientôt disponibles' : 'Detailed analytics coming soon')}
                            >
                                {t("finance.analytics")}
                            </Button>
                        </div>

                    </div>
                </motion.div>

                {/* Transaction Log */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                            <History size={24} />
                            {t("finance.history_title")}
                        </h3>
                        <Button
                            variant="ghost"
                            className="text-sm font-bold text-bouteek-green"
                            onClick={() => setShowAllTransactions(!showAllTransactions)}
                        >
                            {showAllTransactions ? (language === 'fr' ? 'Moins' : 'Show Less') : t("finance.see_all")}
                        </Button>
                    </div>


                    <div className="space-y-3">
                        {transactions.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bouteek-card p-5 group cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            tx.trendingUp ? "bg-bouteek-green/10 text-bouteek-green" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {tx.trendingUp ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{tx.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-black text-lg", tx.trendingUp ? "text-bouteek-green" : "text-foreground")}>
                                            {tx.amount}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                            {tx.status}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Right Side: Wave Top-Up */}
            <div className="lg:col-span-1">
                <div className="bouteek-card p-8 sticky top-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] font-bold text-[10px] uppercase tracking-widest">
                            <ShieldCheck size={14} />
                            Wave Mobile Money
                        </div>

                        {/* Graylist Warning */}
                        {isRestricted && (
                            <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-700 dark:text-yellow-300 text-xs">
                                <p className="font-bold mb-1">⏱️ {language === 'fr' ? 'Compte sous surveillance' : 'Account Under Review'}</p>
                                <p>{language === 'fr'
                                    ? 'Vos recharges sont soumises à une vérification manuelle de 24h.'
                                    : 'Your top-ups are subject to 24h manual verification.'}</p>
                            </div>
                        )}

                        <div className="w-full">
                            <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                {t("finance.amount_topup")}
                            </p>

                            <div className="h-20 bg-muted rounded-3xl flex items-center justify-center border-2 border-transparent focus-within:border-bouteek-green transition-all overflow-hidden group">
                                <span className="text-4xl font-black">{amount || "0"}</span>
                                <span className="ml-2 text-xl text-muted-foreground font-black">XOF</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 w-full">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    onClick={() => pressKey(key)}
                                    className={cn(
                                        "h-16 rounded-2xl text-xl font-black hover:bg-muted active:scale-90 transition-all",
                                        key === "back" ? "text-red-500" : ""
                                    )}
                                >
                                    {key === "back" ? "←" : key}
                                </Button>
                            ))}
                        </div>

                        {/* Wave Payment Link */}
                        <div className="w-full space-y-4 mt-4">
                            <Button
                                onClick={() => window.open(wavePaymentLink, '_blank')}
                                disabled={!amount || Number(amount) < 100}
                                className="w-full h-14 rounded-2xl bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold"
                            >
                                {language === 'fr' ? 'Ouvrir Wave' : 'Open Wave'}
                                <ArrowRight size={18} className="ml-2" />
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 bg-card text-muted-foreground text-xs uppercase">
                                        {language === 'fr' ? 'Puis entrez l\'ID' : 'Then enter ID'}
                                    </span>
                                </div>
                            </div>

                            {/* Transaction ID Input */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="ID Transaction Wave (17 car.)"
                                    value={waveTransactionId}
                                    onChange={(e) => setWaveTransactionId(e.target.value.toUpperCase().slice(0, 17))}
                                    maxLength={17}
                                    className="w-full h-14 bg-muted rounded-2xl px-4 text-center font-mono text-lg tracking-widest border-2 border-transparent focus:border-bouteek-green focus:outline-none transition-all"
                                />
                                <p className="text-center text-xs text-muted-foreground">
                                    {waveTransactionId.length}/17
                                </p>
                            </div>

                            <Button
                                onClick={handleTopUp}
                                disabled={!amount || Number(amount) < 100 || waveTransactionId.length !== 17 || submitting}
                                className="w-full h-14 rounded-2xl bg-bouteek-green text-black font-black uppercase tracking-widest shadow-xl shadow-bouteek-green/20 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {t("finance.pay")}
                                        <ArrowRight size={18} className="ml-2" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center py-2 opacity-50">
                                <img src="https://paydunya.com/assets/images/payment_methods/wave.png" className="h-8 object-contain" alt="Wave" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubscriptionManager({ plans }: { plans: any[] }) {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [merchant, setMerchant] = useState<any>(null);
    const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>("starter");
    const PRICES = {
        starter: 2000,
        launch: 5000,
        growth: 12500,
        pro: 20000
    };
    const [duration, setDuration] = useState<number>(1); // 1, 3, 6, 12
    const [autoRenew, setAutoRenew] = useState(false);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setMerchant(data);
            if (data.subscription_tier) setSelectedPlanSlug(data.subscription_tier);
            if (data.auto_renew) setAutoRenew(data.auto_renew);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load subscription data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setProcessing(true);
        try {
            const basePrice = PRICES[selectedPlanSlug as keyof typeof PRICES] || 0;
            const totalCost = basePrice * duration;
            const currentBalance = Number(merchant.bouteek_cash_balance || 0);

            // Perform atomic subscription purchase via RPC
            const { data: result, error: rpcError } = await supabase.rpc('purchase_subscription', {
                merchant_id_input: merchant.id,
                plan_slug_input: selectedPlanSlug,
                duration_months: duration,
                total_cost: totalCost
            });

            if (rpcError) throw rpcError;

            if (!result.success) {
                // Handle business logic errors returned from RPC
                throw new Error(result.message || "Subscription purchase failed");
            }

            toast.success("Subscription updated!");
            fetchSubscriptionData();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Subscription failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const selectedPlan = plans.find(p => p.slug === selectedPlanSlug) || plans[0];
    const currentPrice = selectedPlan ? selectedPlan.price : 0;
    const discount = duration === 12 ? 0.2 : duration === 6 ? 0.1 : 0;
    const totalPrice = currentPrice * duration * (1 - discount);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-black">{t("finance.sub_manager.title")}</h2>
                <p className="text-muted-foreground">{t("finance.sub_manager.subtitle")}</p>
            </div>

            {/* Optimizer (Optional: Update to accept dynamic plans if needed, skipping for now) */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Duration */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("finance.sub_manager.configure")}: <span className="uppercase text-bouteek-green">{selectedPlanSlug}</span></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>{t("finance.sub_manager.cycle")}</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 6, 12].map((m) => (
                                        <div
                                            key={m}
                                            onClick={() => setDuration(m)}
                                            className={cn(
                                                "cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:bg-muted/50",
                                                duration === m ? "border-black bg-black text-white hover:bg-black" : "border-border/50"
                                            )}
                                        >
                                            <div className="text-2xl font-black">{m}</div>
                                            <div className="text-xs uppercase font-bold opacity-80">{m === 1 ? t("finance.sub_manager.month") : t("finance.sub_manager.months")}</div>
                                            {m > 1 && (
                                                <Badge variant="secondary" className="mt-2 text-[10px] px-1 h-5">
                                                    {t("finance.sub_manager.save")} {m === 12 ? '20%' : m === 6 ? '10%' : '5%'}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 border p-4 rounded-xl bg-muted/20">
                                <Switch id="auto-renew" checked={autoRenew} onCheckedChange={setAutoRenew} />
                                <div className="space-y-1">
                                    <Label htmlFor="auto-renew" className="font-bold">{t("finance.sub_manager.auto_renew")}</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t("finance.sub_manager.auto_renew_desc")}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance Check */}
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-bouteek-green">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">{t("finance.sub_manager.current_balance")}</p>
                                <h3 className="text-2xl font-black font-mono">
                                    {Number(merchant?.bouteek_cash_balance || 0).toLocaleString()} XOF
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <Card className="border-2 border-black h-fit sticky top-6">
                        <CardHeader className="bg-muted/50 pb-4">
                            <CardTitle>{t("finance.sub_manager.order_summary")}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Plan ({selectedPlanSlug})</span>
                                <span className="font-mono">{currentPrice.toLocaleString()} x {duration}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-bold">
                                    <span>{t("finance.sub_manager.discount")}</span>
                                    <span>-{(currentPrice * duration * discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t pt-4 flex justify-between items-end">
                                <span className="font-bold text-lg">{t("finance.sub_manager.total")}</span>
                                <div className="text-right">
                                    <span className="block text-3xl font-black">{totalPrice.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground">XOF</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full h-14 text-lg font-black bg-[#00FF41] hover:bg-[#00b829] text-black"
                                onClick={handleSubscribe}
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="animate-spin" /> : t("finance.sub_manager.confirm")}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
