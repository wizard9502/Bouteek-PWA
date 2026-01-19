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

    const updatePlanLimit = async (planId: string, limit: string, value: string) => {
        // Implementation for limits updates if needed
    };

    const featuresList = [
        { key: "heatmaps", label: "Heatmaps" },
        { key: "seo", label: "Advanced SEO" },
        { key: "team", label: "Team Collaboration" },
        { key: "custom_domain", label: "Custom Domain" },
        { key: "api_access", label: "API Access" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">Plan Management</h1>
                <p className="text-muted-foreground font-medium mt-1">Configure features and limits for each subscription tier.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : (
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
                                    <p className="text-3xl font-black mt-4">
                                        {plan.price.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">XOF</span>
                                    </p>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Feature Availability</p>
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
                                    <Button variant="outline" className="w-full rounded-xl font-bold border-border/50">
                                        Edit Limits
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
