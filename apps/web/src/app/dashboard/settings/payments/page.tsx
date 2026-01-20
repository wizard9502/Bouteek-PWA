"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Save, Smartphone, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

interface PaymentMethod {
    phone: string;
    enabled: boolean;
}

interface PaymentMethods {
    orange_money: PaymentMethod;
    wave: PaymentMethod;
}

export default function PaymentPreferencesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [storefrontId, setStorefrontId] = useState<string | null>(null);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
        orange_money: { phone: "", enabled: false },
        wave: { phone: "", enabled: false },
    });

    useEffect(() => {
        loadPaymentSettings();
    }, []);

    const loadPaymentSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from("merchants")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!merchant) return;

            const { data: storefront } = await supabase
                .from("storefronts")
                .select("id, payment_methods")
                .eq("merchant_id", merchant.id)
                .single();

            if (storefront) {
                setStorefrontId(storefront.id);
                if (storefront.payment_methods) {
                    const methods = typeof storefront.payment_methods === 'string'
                        ? JSON.parse(storefront.payment_methods)
                        : storefront.payment_methods;
                    setPaymentMethods(prev => ({ ...prev, ...methods }));
                }
            }
        } catch (error) {
            console.error("Error loading payment settings:", error);
            toast.error("Failed to load payment settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!storefrontId) {
            toast.error("Storefront not found. Please complete store setup first.");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("storefronts")
                .update({
                    payment_methods: paymentMethods,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", storefrontId);

            if (error) throw error;

            // Haptic feedback
            if ("vibrate" in navigator) navigator.vibrate(50);

            toast.success("Payment settings saved!");
        } catch (error: any) {
            console.error("Error saving payment settings:", error);
            toast.error("Failed to save: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateMethod = (
        provider: "orange_money" | "wave",
        field: "phone" | "enabled",
        value: string | boolean
    ) => {
        setPaymentMethods(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value,
            },
        }));
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black">Payment Preferences</h1>
                    <p className="text-muted-foreground text-sm">
                        Configure mobile money payment methods for your store
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <CreditCard className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold">How it works</p>
                        <p className="opacity-80 mt-1">
                            When customers checkout, they will see your payment numbers. After sending money, 
                            they enter the Transaction ID. You then verify the payment in your dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-6">
                {/* Orange Money */}
                <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#ff7900] flex items-center justify-center">
                                <Smartphone className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Orange Money</h3>
                                <p className="text-xs text-muted-foreground">Accept Orange Money payments</p>
                            </div>
                        </div>
                        <Switch
                            checked={paymentMethods.orange_money.enabled}
                            onCheckedChange={(checked) => updateMethod("orange_money", "enabled", checked)}
                        />
                    </div>

                    {paymentMethods.orange_money.enabled && (
                        <div className="pt-4 border-t space-y-2">
                            <Label htmlFor="om-phone">Orange Money Number</Label>
                            <Input
                                id="om-phone"
                                placeholder="+221 77 XXX XX XX"
                                value={paymentMethods.orange_money.phone}
                                onChange={(e) => updateMethod("orange_money", "phone", e.target.value)}
                                className="h-12 text-lg font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                This number will be shown to customers at checkout
                            </p>
                        </div>
                    )}
                </div>

                {/* Wave */}
                <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#1da1f2] flex items-center justify-center">
                                <Smartphone className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Wave</h3>
                                <p className="text-xs text-muted-foreground">Accept Wave payments</p>
                            </div>
                        </div>
                        <Switch
                            checked={paymentMethods.wave.enabled}
                            onCheckedChange={(checked) => updateMethod("wave", "enabled", checked)}
                        />
                    </div>

                    {paymentMethods.wave.enabled && (
                        <div className="pt-4 border-t space-y-2">
                            <Label htmlFor="wave-phone">Wave Number</Label>
                            <Input
                                id="wave-phone"
                                placeholder="+221 78 XXX XX XX"
                                value={paymentMethods.wave.phone}
                                onChange={(e) => updateMethod("wave", "phone", e.target.value)}
                                className="h-12 text-lg font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                This number will be shown to customers at checkout
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 bg-black text-white font-black text-lg rounded-xl"
            >
                {isSaving ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                    <Save className="mr-2" size={20} />
                )}
                {isSaving ? "Saving..." : "Save Payment Settings"}
            </Button>
        </div>
    );
}
