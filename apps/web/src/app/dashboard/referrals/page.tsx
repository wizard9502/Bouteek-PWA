"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Users,
    Link as LinkIcon,
    Gift,
    TrendingUp,
    Copy,
    Share2,
    Wallet,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

export default function ReferralsPage() {
    return (
        <TranslationProvider>
            <ReferralsContent />
        </TranslationProvider>
    );
}

function ReferralsContent() {
    const { t } = useTranslation();
    const [merchant, setMerchant] = useState<any>(null);
    const [stats, setStats] = useState({
        referralCount: 0,
        pendingEarnings: 0,
        totalWithdrawn: 0
    });
    const [referrals, setReferrals] = useState<any[]>([]);

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

    const copyCode = () => {
        if (!merchant?.referral_code) return;
        navigator.clipboard.writeText(merchant.referral_code);
        toast.success("Referral code copied!");
    };

    return (
        <div className="space-y-10 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">Partner Program</h1>
                <p className="text-muted-foreground font-medium mt-1">Earn 20% commission by referring other merchants to Bouteek.</p>
            </div>

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
                            Grow Together
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                            Build your empire with <span className="text-bouteek-green">Bouteek.</span>
                        </h2>

                        <div className="space-y-4">
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your Private Referral Code</p>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl h-16 flex items-center px-6 font-mono font-black text-2xl tracking-widest">
                                    {merchant?.referral_code || "SET-CODE-IN-PROFILE"}
                                </div>
                                <Button
                                    onClick={copyCode}
                                    className="h-16 w-16 rounded-2xl bg-bouteek-green text-black hover:scale-105 transition-transform"
                                >
                                    <Copy size={24} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-white/5 border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Users className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black">{stats.referralCount}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Referrals</p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Wallet className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black text-bouteek-green">{stats.pendingEarnings.toLocaleString()} <span className="text-[10px] text-white">XOF</span></p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Balance</p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Gift className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black">{stats.totalWithdrawn.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Earnings</p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <Share2 className="text-bouteek-green mb-4" size={24} />
                            <p className="text-3xl font-black">20%</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Comm. Rate</p>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bouteek-card p-8 space-y-4 border-l-4 border-l-bouteek-green">
                    <div className="w-12 h-12 rounded-2xl bg-bouteek-green/10 flex items-center justify-center text-bouteek-green font-black">1</div>
                    <h4 className="font-black">Invite Merchants</h4>
                    <p className="text-xs text-muted-foreground font-medium">Share your custom referral code with other business owners in your network.</p>
                </div>
                <div className="bouteek-card p-8 space-y-4 border-l-4 border-l-blue-500">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">2</div>
                    <h4 className="font-black">They Subscribe</h4>
                    <p className="text-xs text-muted-foreground font-medium">When they use your code to register and subscribe to any paid plan.</p>
                </div>
                <div className="bouteek-card p-8 space-y-4 border-l-4 border-l-purple-500">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black">3</div>
                    <h4 className="font-black">You Get Paid</h4>
                    <p className="text-xs text-muted-foreground font-medium">Receive 20% of their subscription fee monthly as long as they stay active.</p>
                </div>
            </div>

            {/* List of Referrals */}
            <section className="space-y-6">
                <h3 className="text-xl font-black">Your Referrals</h3>
                <div className="bouteek-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Merchant</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Status</th>
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
                                            Active
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                                        You haven't referred any merchants yet. Start sharing your code!
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
