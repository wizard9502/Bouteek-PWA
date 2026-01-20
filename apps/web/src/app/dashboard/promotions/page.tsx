"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FeatureGate } from "@/components/FeatureGate";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Percent,
    DollarSign,
    Gift,
    Truck,
    Calendar,
    Trash2,
    Edit,
    Copy,
    Loader2,
    Tag,
} from "lucide-react";

interface Promotion {
    id: string;
    name: string;
    code: string | null;
    type: "percentage" | "fixed" | "buy_x_get_y" | "free_shipping";
    value: number | null;
    buy_quantity: number | null;
    get_quantity: number | null;
    max_uses: number | null;
    used_count: number;
    starts_at: string;
    ends_at: string | null;
    is_active: boolean;
}

const promoTypeIcons = {
    percentage: Percent,
    fixed: DollarSign,
    buy_x_get_y: Gift,
    free_shipping: Truck,
};

const promoTypeLabels = {
    percentage: "Percentage Off",
    fixed: "Fixed Amount Off",
    buy_x_get_y: "Buy X Get Y",
    free_shipping: "Free Shipping",
};

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [merchantId, setMerchantId] = useState<number | null>(null);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from("merchants")
                .select("id")
                .eq("userId", user.id)
                .single();

            if (!merchant) return;
            setMerchantId(merchant.id);

            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .eq("merchant_id", merchant.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            console.error("Error loading promotions:", error);
            toast.error("Failed to load promotions");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePromotion = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from("promotions")
                .update({ is_active: isActive })
                .eq("id", id);

            if (error) throw error;

            setPromotions(prev =>
                prev.map(p => (p.id === id ? { ...p, is_active: isActive } : p))
            );
            toast.success(isActive ? "Promotion activated" : "Promotion deactivated");
        } catch (error) {
            toast.error("Failed to update promotion");
        }
    };

    const deletePromotion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promotion?")) return;

        try {
            const { error } = await supabase
                .from("promotions")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setPromotions(prev => prev.filter(p => p.id !== id));
            toast.success("Promotion deleted");
        } catch (error) {
            toast.error("Failed to delete promotion");
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied!");
    };

    const formatValue = (promo: Promotion): string => {
        switch (promo.type) {
            case "percentage":
                return `${promo.value}% off`;
            case "fixed":
                return `${promo.value?.toLocaleString()} XOF off`;
            case "buy_x_get_y":
                return `Buy ${promo.buy_quantity} Get ${promo.get_quantity}`;
            case "free_shipping":
                return "Free Shipping";
            default:
                return "";
        }
    };

    return (
        <FeatureGate feature="promotions_engine">
            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="hero-text !text-3xl">Promotions</h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Create discount codes and campaigns
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="font-bold"
                    >
                        <Plus className="mr-2" size={18} />
                        Create Promotion
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Active</p>
                        <p className="text-2xl font-black mt-1">
                            {promotions.filter(p => p.is_active).length}
                        </p>
                    </Card>
                    <Card className="p-4 rounded-2xl">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Total Uses</p>
                        <p className="text-2xl font-black mt-1">
                            {promotions.reduce((sum, p) => sum + p.used_count, 0)}
                        </p>
                    </Card>
                </div>

                {/* Promotions List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : promotions.length === 0 ? (
                    <Card className="p-12 rounded-2xl text-center">
                        <Tag className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h3 className="font-bold text-lg">No Promotions Yet</h3>
                        <p className="text-muted-foreground mt-1">
                            Create your first discount code to boost sales
                        </p>
                        <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-2" size={18} />
                            Create Promotion
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {promotions.map((promo, index) => {
                                const Icon = promoTypeIcons[promo.type];
                                const isExpired = promo.ends_at && new Date(promo.ends_at) < new Date();

                                return (
                                    <motion.div
                                        key={promo.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className={`p-4 rounded-2xl ${!promo.is_active || isExpired ? "opacity-60" : ""}`}>
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className="w-12 h-12 rounded-xl bg-bouteek-green/10 flex items-center justify-center shrink-0">
                                                    <Icon className="text-bouteek-green" size={24} />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold truncate">{promo.name}</h3>
                                                        {isExpired && (
                                                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                                                                Expired
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                        <span className="font-medium">{formatValue(promo)}</span>
                                                        {promo.code && (
                                                            <button
                                                                onClick={() => copyCode(promo.code!)}
                                                                className="flex items-center gap-1 font-mono bg-muted px-2 py-0.5 rounded hover:bg-muted/80"
                                                            >
                                                                {promo.code}
                                                                <Copy size={12} />
                                                            </button>
                                                        )}
                                                        <span>
                                                            {promo.used_count} / {promo.max_uses || "∞"} uses
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={promo.is_active}
                                                        onCheckedChange={(checked) => togglePromotion(promo.id, checked)}
                                                        disabled={isExpired}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deletePromotion(promo.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Create Modal - simplified inline form */}
                <AnimatePresence>
                    {showCreateModal && (
                        <CreatePromotionModal
                            merchantId={merchantId!}
                            onClose={() => setShowCreateModal(false)}
                            onCreated={(promo) => {
                                setPromotions(prev => [promo, ...prev]);
                                setShowCreateModal(false);
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </FeatureGate>
    );
}

interface CreateModalProps {
    merchantId: number;
    onClose: () => void;
    onCreated: (promo: Promotion) => void;
}

function CreatePromotionModal({ merchantId, onClose, onCreated }: CreateModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState<Promotion["type"]>("percentage");
    const [value, setValue] = useState("");
    const [maxUses, setMaxUses] = useState("");

    const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a promotion name");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from("promotions")
                .insert({
                    merchant_id: merchantId,
                    name: name.trim(),
                    code: code.trim() || null,
                    type,
                    value: value ? parseFloat(value) : null,
                    max_uses: maxUses ? parseInt(maxUses) : null,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Promotion created!");
            onCreated(data as Promotion);
        } catch (error: any) {
            toast.error("Failed to create: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
            >
                <h2 className="text-xl font-black">Create Promotion</h2>

                <div className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Summer Sale"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Discount Code (optional)</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="SUMMER20"
                                className="font-mono"
                            />
                            <Button variant="outline" onClick={generateCode}>
                                Generate
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label>Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {(["percentage", "fixed", "buy_x_get_y", "free_shipping"] as const).map((t) => {
                                const Icon = promoTypeIcons[t];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${type === t
                                                ? "border-bouteek-green bg-bouteek-green/5"
                                                : "border-border"
                                            }`}
                                    >
                                        <Icon size={20} className={type === t ? "text-bouteek-green" : ""} />
                                        <p className="text-xs font-medium mt-1">{promoTypeLabels[t]}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {(type === "percentage" || type === "fixed") && (
                        <div>
                            <Label>{type === "percentage" ? "Percentage" : "Amount (XOF)"}</Label>
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={type === "percentage" ? "20" : "5000"}
                                className="mt-1"
                            />
                        </div>
                    )}

                    <div>
                        <Label>Max Uses (optional)</Label>
                        <Input
                            type="number"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            placeholder="Unlimited"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 font-bold">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create"}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
