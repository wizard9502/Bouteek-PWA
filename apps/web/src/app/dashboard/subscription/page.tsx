"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Check, Loader2, ShieldCheck, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/TranslationContext";
import { useRouter } from "next/navigation";

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 2000,
        description: 'Perfect for small businesses just getting started.',
        features: ['Up to 50 listings', 'Basic Analytics', 'Standard Support', '5% Commission']
    },
    {
        id: 'launch',
        name: 'Launch',
        price: 5000,
        description: 'For growing businesses ready to scale.',
        features: ['Up to 200 listings', 'Advanced Analytics', 'Priority Support', '3% Commission', 'Custom Domain']
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 12500,
        description: 'Maximum power for established brands.',
        features: ['Unlimited listings', 'Real-time Analytics', 'Dedicated Manager', '1.5% Commission', 'API Access', 'White-labeling']
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 20000,
        description: 'Complete enterprise solution.',
        features: ['Unlimited listings', 'Custom Reports', '24/7 Phone Support', '0.75% Commission', 'Multi-store Management']
    }
];

export default function SubscriptionPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('starter');
    const [merchantDetails, setMerchantDetails] = useState<any>(null);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setMerchantDetails(data);
                setCurrentPlan(data.subscription_tier || 'starter');
            }
        } catch (error) {
            console.error("Fetch sub error", error);
            toast.error("Failed to load subscription details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (plan: any) => {
        if (!merchantDetails) return;

        const balance = merchantDetails.bouteek_cash_balance || 0;

        if (balance < plan.price) {
            toast.error(
                <div onClick={() => router.push('/dashboard/finance')} className="cursor-pointer">
                    Insufficient Balance ({balance.toLocaleString()} XOF).
                    <span className="font-bold underline ml-2">Click to Top Up</span>
                </div>
            );
            return;
        }

        setUpgrading(plan.id);

        try {
            // Confirm Dialog could be added here

            // Use RPC to purchase subscription atomically
            const { data: result, error: rpcError } = await supabase.rpc('purchase_subscription', {
                merchant_id_input: merchantDetails.id,
                plan_slug_input: plan.id,
                duration_months: 1, // Default to 1 month for Quick Upgrade
                total_cost: plan.price
            });

            if (rpcError) throw rpcError;

            if (!result.success) {
                throw new Error(result.message || "Subscription purchase failed");
            }

            toast.success(`Successfully upgraded to ${plan.name} Plan!`);
            fetchSubscription(); // Refresh state

        } catch (error: any) {
            console.error("Upgrade error", error);
            toast.error(error.message || "Upgrade failed");
        } finally {
            setUpgrading(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight">{t("subscription.title") || "Upgrade your Business"}</h1>
                    <p className="text-xl text-muted-foreground w-full md:w-2/3">
                        {t("subscription.subtitle") || "Choose the perfect plan to grow your Bouteek. Scale your features as you scale your sales."}
                    </p>
                </div>
                <div className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-4">
                    <Wallet size={24} className="text-bouteek-green" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Wallet Balance</p>
                        <p className="text-xl font-black">{merchantDetails?.bouteek_cash_balance?.toLocaleString() || 0} XOF</p>
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-xl font-bold text-xs h-8" onClick={() => router.push('/dashboard/finance')}>
                        Top Up
                    </Button>
                </div>
            </div>

            {/* Current Plan Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Current Plan</p>
                        <h2 className="text-2xl font-black capitalize">{currentPlan} Tier</h2>
                    </div>
                </div>
                <div className="flex gap-3">
                    {currentPlan !== 'pro' && (
                        <div className="text-sm font-medium text-muted-foreground self-center">
                            Upgrade to unlock lower commissions
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const isPopular = plan.id === 'launch';
                    const canAfford = (merchantDetails?.bouteek_cash_balance || 0) >= plan.price;

                    return (
                        <Card key={plan.id} className={`rounded-3xl flex flex-col relative overflow-hidden transition-all duration-300 ${isCurrent ? 'border-primary shadow-lg scale-[1.02]' : 'hover:border-primary/50 hover:shadow-md'}`}>

                            {isPopular && !isCurrent && (
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-bl-xl">
                                    Most Popular
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span className="text-xl font-black capitalize">{plan.name}</span>
                                    {isCurrent && <Badge variant="secondary" className="font-bold">Active</Badge>}
                                </CardTitle>
                                <CardDescription className="min-h-[40px] mt-2 font-medium">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 flex-1">
                                <div>
                                    <span className="text-3xl font-black">{plan.price.toLocaleString()}</span>
                                    <span className="text-muted-foreground font-bold ml-1 text-sm">XOF / mo</span>
                                </div>

                                <div className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 p-0.5 rounded-full bg-green-100 text-green-600">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter>
                                {isCurrent ? (
                                    <Button disabled className="w-full rounded-xl font-bold bg-muted text-muted-foreground h-12">
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleUpgrade(plan)}
                                        disabled={!!upgrading}
                                        className={`w-full rounded-xl font-bold h-12 ${plan.id === 'pro' ? 'bg-black text-white hover:bg-black/90' : ''}`}
                                        variant={plan.id === 'starter' ? 'outline' : 'default'}
                                    >
                                        {upgrading === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : !canAfford ? (
                                            <span className="flex items-center gap-2">Insufficent Funds <AlertCircle size={16} /></span>
                                        ) : (
                                            <>Confirm Upgrade</>
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
