"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Copy,
    Share2,
    Users,
    DollarSign,
    Gift,
    CheckCircle2,
    Clock,
    Loader2,
    ExternalLink,
    ArrowRight,
    Wallet,
} from "lucide-react";

interface Referral {
    id: string;
    referred_user_id: string;
    status: "pending" | "converted" | "paid";
    commission_amount: number;
    created_at: string;
    converted_at: string | null;
    users?: {
        email: string;
    };
}

interface ReferralStats {
    totalReferrals: number;
    convertedReferrals: number;
    pendingEarnings: number;
    totalEarnings: number;
}

export default function ReferralsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [stats, setStats] = useState<ReferralStats>({
        totalReferrals: 0,
        convertedReferrals: 0,
        pendingEarnings: 0,
        totalEarnings: 0,
    });
    const [referralCode, setReferralCode] = useState<string>("");
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [isRequestingPayout, setIsRequestingPayout] = useState(false);

    const fetchReferralData = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to view referrals");
                return;
            }

            // Get merchant data
            const { data: merchant, error: merchantError } = await supabase
                .from("merchants")
                .select("id, referral_code")
                .eq("user_id", user.id)
                .single();

            if (merchantError || !merchant) {
                toast.error("Merchant profile not found");
                return;
            }

            setMerchantId(merchant.id);
            setReferralCode(merchant.referral_code || generateReferralCode());

            // Fetch referrals
            const { data: referralsData, error: referralsError } = await supabase
                .from("referrals")
                .select(`
                    id,
                    referred_user_id,
                    status,
                    commission_amount,
                    created_at,
                    converted_at,
                    users:referred_user_id (email)
                `)
                .eq("referrer_id", merchant.id)
                .order("created_at", { ascending: false });

            if (referralsError) throw referralsError;

            const referralsList = referralsData || [];
            setReferrals(referralsList);

            // Calculate stats
            const totalReferrals = referralsList.length;
            const convertedReferrals = referralsList.filter(r => r.status === "converted" || r.status === "paid").length;
            const pendingEarnings = referralsList
                .filter(r => r.status === "converted")
                .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
            const totalEarnings = referralsList
                .filter(r => r.status === "paid")
                .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

            setStats({
                totalReferrals,
                convertedReferrals,
                pendingEarnings,
                totalEarnings,
            });

        } catch (error) {
            console.error("Error fetching referral data:", error);
            toast.error("Failed to load referral data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    const generateReferralCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "BTK-";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast.success("Referral code copied!");

        // Haptic feedback
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
    };

    const copyReferralLink = () => {
        const link = `${window.location.origin}/?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        toast.success("Referral link copied!");
    };

    const shareReferral = async () => {
        const link = `${window.location.origin}/?ref=${referralCode}`;
        const shareData = {
            title: "Join Bouteek!",
            text: "Sign up using my referral code and we both earn rewards!",
            url: link,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            copyReferralLink();
        }
    };

    const requestPayout = async () => {
        if (stats.pendingEarnings <= 0) {
            toast.error("No pending earnings to withdraw");
            return;
        }

        setIsRequestingPayout(true);
        try {
            const { error } = await supabase
                .from("affiliate_payouts")
                .insert({
                    referrer_id: merchantId,
                    amount: stats.pendingEarnings,
                    status: "pending",
                });

            if (error) throw error;

            // Update referral statuses to "paid"
            await supabase
                .from("referrals")
                .update({ status: "paid" })
                .eq("referrer_id", merchantId)
                .eq("status", "converted");

            toast.success("Payout request submitted!");
            fetchReferralData();

        } catch (error) {
            console.error("Error requesting payout:", error);
            toast.error("Failed to submit payout request");
        } finally {
            setIsRequestingPayout(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                        <Clock size={12} />
                        Pending
                    </Badge>
                );
            case "converted":
                return (
                    <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                        <DollarSign size={12} />
                        Earned
                    </Badge>
                );
            case "paid":
                return (
                    <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 size={12} />
                        Paid
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
                <p className="text-muted-foreground font-medium">Loading referral data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="hero-text !text-3xl">Referral Program</h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Earn rewards by inviting other merchants to join Bouteek
                </p>
            </div>

            {/* Referral Code Card */}
            <Card className="rounded-3xl bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Your Referral Code
                        </p>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-black tracking-wider font-mono">
                                {referralCode}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl bg-white/10 border-white/20 hover:bg-white/20"
                                onClick={copyReferralCode}
                            >
                                <Copy size={18} />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                className="rounded-xl font-bold bg-bouteek-green text-black hover:bg-bouteek-green/90"
                                onClick={copyReferralLink}
                            >
                                <Copy className="mr-2" size={16} />
                                Copy Link
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold bg-white/10 border-white/20 hover:bg-white/20"
                                onClick={shareReferral}
                            >
                                <Share2 className="mr-2" size={16} />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <Gift
                        className="absolute -bottom-8 -right-8 text-white/5"
                        size={200}
                    />
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground">Total Referrals</p>
                            <p className="text-2xl font-black">{stats.totalReferrals}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground">Converted</p>
                            <p className="text-2xl font-black">{stats.convertedReferrals}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="text-amber-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground">Pending</p>
                            <p className="text-2xl font-black">{stats.pendingEarnings.toLocaleString()} <span className="text-sm font-medium">XOF</span></p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Wallet className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground">Total Earned</p>
                            <p className="text-2xl font-black">{stats.totalEarnings.toLocaleString()} <span className="text-sm font-medium">XOF</span></p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payout Request */}
            {stats.pendingEarnings > 0 && (
                <Card className="p-6 rounded-2xl border-2 border-bouteek-green/30 bg-bouteek-green/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Ready to Withdraw?</h3>
                            <p className="text-muted-foreground">
                                You have <span className="font-bold text-bouteek-green">{stats.pendingEarnings.toLocaleString()} XOF</span> in pending earnings
                            </p>
                        </div>
                        <Button
                            className="rounded-xl font-bold"
                            onClick={requestPayout}
                            disabled={isRequestingPayout}
                        >
                            {isRequestingPayout ? (
                                <Loader2 className="animate-spin mr-2" size={16} />
                            ) : (
                                <ArrowRight className="mr-2" size={16} />
                            )}
                            Request Payout
                        </Button>
                    </div>
                </Card>
            )}

            {/* Referrals List */}
            <div className="space-y-4">
                <h3 className="text-xl font-black">Your Referrals</h3>

                {referrals.length === 0 ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h4 className="font-bold text-lg">No Referrals Yet</h4>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                            Share your referral code with other merchants to start earning rewards
                        </p>
                        <Button className="mt-6" onClick={shareReferral}>
                            <Share2 className="mr-2" size={16} />
                            Share Your Code
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {referrals.map((referral, index) => (
                            <motion.div
                                key={referral.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-4 rounded-2xl hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                                {(referral.users?.email || "??").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold">
                                                    {referral.users?.email || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {new Date(referral.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">
                                                    +{(referral.commission_amount || 0).toLocaleString()} XOF
                                                </p>
                                            </div>
                                            {getStatusBadge(referral.status)}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* How it Works */}
            <Card className="p-8 rounded-3xl bg-gray-50">
                <h3 className="text-xl font-black mb-6">How the Referral Program Works</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shrink-0">
                            1
                        </div>
                        <div>
                            <h4 className="font-bold">Share Your Code</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Share your unique referral code with other merchants
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black shrink-0">
                            2
                        </div>
                        <div>
                            <h4 className="font-bold">They Subscribe</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                When they sign up and subscribe to a paid plan
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bouteek-green text-black flex items-center justify-center font-black shrink-0">
                            3
                        </div>
                        <div>
                            <h4 className="font-bold">You Earn</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                You receive a 10% commission on their first month
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
