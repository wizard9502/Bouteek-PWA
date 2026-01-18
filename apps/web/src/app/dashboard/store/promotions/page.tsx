"use client";

import { useState } from "react";
import {
    TicketPercent,
    Plus,
    Trash2,
    Calendar,
    Tag,
    Users,
    ChevronRight,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";

import Link from "next/link";

export default function PromotionsPage() {
    const { t, language } = useTranslation();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        type: "percentage",
        value: "",
        max_usage: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
            if (!merchant) return;

            const { data } = await supabase
                .from('merchant_coupons')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            setCoupons(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCoupon.code || !newCoupon.value) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();

            const { error } = await supabase.from('merchant_coupons').insert({
                merchant_id: merchant?.id,
                code: newCoupon.code.toUpperCase().trim(),
                type: newCoupon.type,
                value: Number(newCoupon.value),
                max_usage: newCoupon.max_usage ? Number(newCoupon.max_usage) : null
            });

            if (error) throw error;
            toast.success("Coupon created!");
            setIsCreateOpen(false);
            fetchCoupons();
            setNewCoupon({ code: "", type: "percentage", value: "", max_usage: "" });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('merchant_coupons').delete().eq('id', id);
            if (error) throw error;
            setCoupons(coupons.filter(c => c.id !== id));
            toast.success("Coupon deleted");
        } catch (error: any) {
            toast.error(error.message);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Moteur de Promotions" : "Promotions Engine"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Gérez les codes promo et les campagnes de réduction." : "Manage discount codes and sales campaigns."}</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl bg-bouteek-green text-black font-bold h-12 px-6">
                            <Plus className="mr-2" size={20} />
                            {language === 'fr' ? "Créer un Code" : "Create Coupon"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-none p-8 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">{language === 'fr' ? "Nouveau Coupon" : "New Coupon"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{language === 'fr' ? "Code de Réduction" : "Promo Code"}</Label>
                                <Input
                                    placeholder="SUMMER20"
                                    className="h-12 rounded-xl bg-muted/30 font-black"
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                                    <Select value={newCoupon.type} onValueChange={v => setNewCoupon({ ...newCoupon, type: v })}>
                                        <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed (XOF)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</Label>
                                    <Input
                                        type="number"
                                        className="h-12 rounded-xl bg-muted/30 font-bold"
                                        value={newCoupon.value}
                                        onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usage Limit (Optional)</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    className="h-12 rounded-xl bg-muted/30 font-bold"
                                    value={newCoupon.max_usage}
                                    onChange={e => setNewCoupon({ ...newCoupon, max_usage: e.target.value })}
                                />
                            </div>
                            <Button
                                onClick={handleCreate}
                                disabled={isSaving}
                                className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-black/90"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : (language === 'fr' ? "Enregistrer" : "Save Coupon")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-4xl border-border/50 bg-gradient-to-br from-bouteek-green/5 to-transparent">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue via Coupons</p>
                    <h3 className="text-3xl font-black mt-2">1,245,000 <span className="text-sm opacity-50">XOF</span></h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Campaigns</p>
                    <h3 className="text-3xl font-black mt-2">12</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coupons Redeemed</p>
                    <h3 className="text-3xl font-black mt-2">489</h3>
                </Card>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Codes Promo Actifs" : "Active Promo Codes"}</h3>
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground font-medium">No coupons found. Create your first one above!</div>
                    ) : coupons.map((coupon, i) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bouteek-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-bouteek-green/10 group-hover:text-bouteek-green transition-colors">
                                    <TicketPercent size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-xl tracking-tight">{coupon.code}</h4>
                                        <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase ${coupon.status === 'active' ? 'bg-bouteek-green text-black' :
                                            coupon.status === 'expired' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                            {coupon.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toLocaleString()} XOF`} {language === 'fr' ? "Réduction" : "Discount"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{language === 'fr' ? "Utilisations" : "Redemptions"}</p>
                                    <p className="text-lg font-black mt-1">{coupon.usage_count} / {coupon.max_usage || '∞'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="rounded-xl border-border/50 text-red-500 hover:bg-red-50" onClick={() => handleDelete(coupon.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Empty State / Tip */}
            <div className="bouteek-card p-10 flex flex-col items-center text-center gap-6 border-dashed border-2 border-border/50">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Tag size={40} />
                </div>
                <div>
                    <h4 className="text-xl font-black">Boost your sales by 25%</h4>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        Setting a "Buy 1 Get 1 Free" or a 10% discount for first-time buyers significantly increases conversion rates.
                    </p>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-border/50 uppercase text-[10px] tracking-widest">
                    Learn about strategy
                </Button>
            </div>
        </div>
    );
}
