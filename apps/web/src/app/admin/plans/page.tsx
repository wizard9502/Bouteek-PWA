"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";


export default function PlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const updatePlanCommission = async (planId: string, value: string) => {
        setSaving(planId);
        try {
            const { error } = await supabase
                .from('plans')
                .update({ commission_rate: Number(value) })
                .eq('id', planId);

            if (error) throw error;
            setPlans(plans.map(p => p.id === planId ? { ...p, commission_rate: Number(value) } : p));
            toast.success("Commission rate updated");
        } catch (error) {
            toast.error("Failed to update commission");
        } finally {
            setSaving(null);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .order('price', { ascending: true });

            if (error) throw error;
            setPlans(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    const updatePlanFeature = async (planId: string, feature: string, value: boolean) => {
        setSaving(planId);
        try {
            const plan = plans.find(p => p.id === planId);
            const updatedFeatures = { ...plan.features, [feature]: value };

            const { error } = await supabase
                .from('plans')
                .update({ features: updatedFeatures })
                .eq('id', planId);

            if (error) throw error;

            setPlans(plans.map(p => p.id === planId ? { ...p, features: updatedFeatures } : p));
            toast.success("Plan updated");
        } catch (error) {
            toast.error("Failed to update plan");
        } finally {
            setSaving(null);
        }
    };

    const [limitPlan, setLimitPlan] = useState<any>(null);
    const [tempLimits, setTempLimits] = useState<any>({});

    const openLimitEditor = (plan: any) => {
        setLimitPlan(plan);
        setTempLimits(plan.limits || {});
    };

    const saveLimits = async () => {
        if (!limitPlan) return;
        setSaving(limitPlan.id);
        try {
            const { error } = await supabase
                .from('plans')
                .update({ limits: tempLimits })
                .eq('id', limitPlan.id);

            if (error) throw error;
            setPlans(plans.map(p => p.id === limitPlan.id ? { ...p, limits: tempLimits } : p));
            toast.success("Limits updated");
            setLimitPlan(null);
        } catch (error) {
            toast.error("Failed to save limits");
        } finally {
            setSaving(null);
        }
    };

    const featuresList = [
        { key: "basic_stats", label: "Basic Stats" },
        { key: "standard_seo", label: "Standard SEO" },
        { key: "customer_reviews", label: "Customer Reviews" },
        { key: "pdf_csv_reports", label: "PDF/CSV Reports" },
        { key: "rbac", label: "Team Roles (RBAC)" },
        { key: "promotions_engine", label: "Promotions Engine" },
        { key: "receipt_builder", label: "Receipt Builder" },
        { key: "heatmaps", label: "Performance Heatmaps" },
        { key: "audit_logs", label: "Audit Logs" },
        { key: "realtime_collab", label: "Real-time Collaboration" },
        { key: "custom_domain", label: "Custom Domain" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">Plan Management</h1>
                <p className="text-gray-600 font-medium mt-1">Configure features and limits for each subscription tier.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-8 rounded-3xl border-border/50 h-full flex flex-col gap-6 hover:border-bouteek-green/30 transition-all">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-2xl uppercase tracking-tight">{plan.name}</h3>
                                            <Badge className="bg-muted text-foreground hover:bg-muted font-mono">{plan.slug}</Badge>
                                        </div>
                                        <p className="text-gray-700 font-black mt-4">
                                            {plan.price.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">XOF</span>
                                        </p>
                                        <div className="mt-4 space-y-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Commission Rate (%)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    defaultValue={plan.commission_rate || 0}
                                                    onBlur={(e) => updatePlanCommission(plan.id, e.target.value)}
                                                    className="h-10 w-24 font-bold bg-muted/30"
                                                />
                                                <span className="font-bold text-sm">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Feature Availability</p>
                                        <div className="space-y-4">
                                            {featuresList.map((feature) => (
                                                <div key={feature.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                                                    <span className="font-bold text-sm">{feature.label}</span>
                                                    <Switch
                                                        checked={plan.features?.[feature.key] || false}
                                                        onCheckedChange={(checked) => updatePlanFeature(plan.id, feature.key, checked)}
                                                        disabled={saving === plan.id}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border/50">
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl font-bold border-border/50"
                                            onClick={() => openLimitEditor(plan)}
                                        >
                                            Edit Limits
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Limits Editor Modal - Simple implementation using fixed position overlay if Dialog not available or complicated, relying on basic divs for speed/reliability */}
                    {limitPlan && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                            <Card className="w-full max-w-md p-6 rounded-3xl shadow-2xl bg-white dark:bg-zinc-900 border-border">
                                <div className="mb-6">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Limits: {limitPlan.name}</h3>
                                    <p className="text-sm text-muted-foreground">Set usage quotas. Use -1 for unlimited.</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Max Products</Label>
                                        <Input
                                            type="number"
                                            value={tempLimits.products ?? 0}
                                            onChange={e => setTempLimits({ ...tempLimits, products: Number(e.target.value) })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Images per Product</Label>
                                        <Input
                                            type="number"
                                            value={tempLimits.images ?? 0}
                                            onChange={e => setTempLimits({ ...tempLimits, images: Number(e.target.value) })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Storage (MB)</Label>
                                        <Input
                                            type="number"
                                            value={tempLimits.storage_mb ?? 100}
                                            onChange={e => setTempLimits({ ...tempLimits, storage_mb: Number(e.target.value) })}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <Button variant="ghost" onClick={() => setLimitPlan(null)}>Cancel</Button>
                                    <Button onClick={saveLimits} disabled={!!saving}>
                                        {saving ? <Loader2 className="animate-spin" /> : "Save Limits"}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
