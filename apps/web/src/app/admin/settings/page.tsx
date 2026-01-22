"use client";

import { useEffect, useState } from "react";
import { Save, AlertTriangle, Settings2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSystemSettings, updateSystemSettings } from "@/lib/adminData";
import { supabase } from "@/lib/supabaseClient";

export default function AdminSettings() {
    const [isLoading, setIsLoading] = useState(true);

    // Config State
    const [generalConfig, setGeneralConfig] = useState<any>({
        free_trial_enabled: true,
        maintenance_mode: false
    });

    const [pricingConfig, setPricingConfig] = useState<any>({
        starter: { price: 2000, commission_rate: 0.05 },
        launch: { price: 5000, commission_rate: 0.03 },
        growth: { price: 12500, commission_rate: 0.015 },
        pro: { price: 20000, commission_rate: 0.0075 }
    });

    useEffect(() => {
        async function load() {
            const [gen, price] = await Promise.all([
                getSystemSettings('general'),
                getSystemSettings('subscription_pricing')
            ]);

            if (gen) setGeneralConfig(gen);
            if (price) setPricingConfig(price);
            setIsLoading(false);
        }
        load();
    }, []);

    const handleSaveGeneral = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await updateSystemSettings('general', generalConfig, user?.id || 'system');
        alert("General settings saved.");
    };

    const handleSavePricing = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await updateSystemSettings('subscription_pricing', pricingConfig, user?.id || 'system');
        alert("Pricing settings saved.");
    };

    // Helper to update deeply nested state safely
    const updatePricing = (tier: string, field: string, value: any) => {
        setPricingConfig((prev: any) => ({
            ...prev,
            [tier]: {
                ...prev[tier],
                [field]: parseFloat(value)
            }
        }));
    };

    if (isLoading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900">System Configuration</h1>

            {/* General Settings */}
            <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg"><Settings2 size={24} /></div>
                    <h3 className="text-xl font-bold">General Settings</h3>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl bg-gray-50/50">
                    <div className="space-y-1">
                        <Label className="text-base font-bold">Free Trial Enabled</Label>
                        <p className="text-sm text-gray-600">Allow new merchants to try specifically for 14 days.</p>
                    </div>
                    <Switch
                        checked={generalConfig.free_trial_enabled}
                        onCheckedChange={(checked) => setGeneralConfig({ ...generalConfig, free_trial_enabled: checked })}
                    />
                </div>

                <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50/50 rounded-2xl">
                    <div className="space-y-1">
                        <Label className="text-base font-bold text-amber-900 flex items-center gap-2">
                            <AlertTriangle size={16} /> Maintenance Mode
                        </Label>
                        <p className="text-sm text-amber-700">Disable platform access for all non-admin users.</p>
                    </div>
                    <Switch
                        checked={generalConfig.maintenance_mode}
                        onCheckedChange={(checked) => setGeneralConfig({ ...generalConfig, maintenance_mode: checked })}
                    />
                </div>

                <Button onClick={handleSaveGeneral} className="w-full h-12 rounded-xl font-bold">
                    <Save className="mr-2 w-4 h-4" /> Save General Settings
                </Button>
            </div>

            {/* Pricing Settings */}
            <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg"><DollarSign size={24} /></div>
                    <h3 className="text-xl font-bold">Subscription Pricing & Commissions</h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['starter', 'launch', 'growth', 'pro'].map((tier) => (
                        <div key={tier} className="p-4 border rounded-2xl space-y-4">
                            <h4 className="font-black text-lg capitalize text-center border-b pb-2">{tier}</h4>

                            <div className="space-y-2">
                                <Label>Price (XOF)</Label>
                                <Input
                                    type="number"
                                    value={pricingConfig[tier]?.price}
                                    onChange={(e) => updatePricing(tier, 'price', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Commission (%)</Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={pricingConfig[tier]?.commission_rate}
                                    onChange={(e) => updatePricing(tier, 'commission_rate', e.target.value)}
                                />
                                <p className="text-xs text-gray-600 text-right">
                                    {(pricingConfig[tier]?.commission_rate * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={handleSavePricing} className="w-full h-12 rounded-xl font-bold bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 w-4 h-4" /> Update Pricing Models
                </Button>
            </div>
        </div>
    );
}
