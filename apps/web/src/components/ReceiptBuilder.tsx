"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FeatureGate } from "@/components/FeatureGate";
import { motion } from "framer-motion";
import {
    Save,
    Image,
    Type,
    Link2,
    Instagram,
    Loader2,
    Smartphone,
    Receipt,
} from "lucide-react";

interface ReceiptTemplate {
    show_logo: boolean;
    header_text: string;
    footer_text: string;
    show_social_links: boolean;
    accent_color: string;
    include_qr_code: boolean;
    custom_message: string;
}

const defaultTemplate: ReceiptTemplate = {
    show_logo: true,
    header_text: "",
    footer_text: "Thank you for your purchase!",
    show_social_links: true,
    accent_color: "#000000",
    include_qr_code: false,
    custom_message: "",
};

interface ReceiptBuilderProps {
    /** If embedded in a settings page */
    embedded?: boolean;
}

export function ReceiptBuilder({ embedded = false }: ReceiptBuilderProps) {
    const [template, setTemplate] = useState<ReceiptTemplate>(defaultTemplate);
    const [storeName, setStoreName] = useState("Your Store");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTemplate();
    }, []);

    const loadTemplate = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from("merchants")
                .select("id, businessName")
                .eq("userId", user.id)
                .single();

            if (!merchant) return;

            setStoreName(merchant.businessName || "Your Store");

            // Get storefront for logo
            const { data: storefront } = await supabase
                .from("storefronts")
                .select("logo_url")
                .eq("merchant_id", merchant.id)
                .single();

            if (storefront?.logo_url) {
                setLogoUrl(storefront.logo_url);
            }

            // Get receipt template
            const { data: templateData } = await supabase
                .from("receipt_templates")
                .select("template_data")
                .eq("merchant_id", merchant.id)
                .single();

            if (templateData?.template_data) {
                setTemplate(prev => ({ ...prev, ...templateData.template_data }));
            }
        } catch (error) {
            console.error("Error loading template:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: merchant } = await supabase
                .from("merchants")
                .select("id")
                .eq("userId", user.id)
                .single();

            if (!merchant) throw new Error("Merchant not found");

            const { error } = await supabase
                .from("receipt_templates")
                .upsert({
                    merchant_id: merchant.id,
                    template_data: template,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: "merchant_id",
                });

            if (error) throw error;

            if ("vibrate" in navigator) navigator.vibrate(50);
            toast.success("Receipt template saved!");
        } catch (error: any) {
            console.error("Error saving template:", error);
            toast.error("Failed to save: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const updateTemplate = (key: keyof ReceiptTemplate, value: any) => {
        setTemplate(prev => ({ ...prev, [key]: value }));
    };

    const Container = embedded ? "div" : Card;
    const containerClass = embedded ? "space-y-6" : "p-6 rounded-2xl space-y-6";

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <FeatureGate feature="receipt_builder">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Editor */}
                <Container className={containerClass}>
                    <div className="flex items-center gap-3">
                        <Receipt className="text-muted-foreground" size={24} />
                        <h2 className="text-xl font-black">Receipt Template</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Logo Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Image size={20} />
                                <div>
                                    <p className="font-bold text-sm">Show Logo</p>
                                    <p className="text-xs text-muted-foreground">Display your store logo on receipts</p>
                                </div>
                            </div>
                            <Switch
                                checked={template.show_logo}
                                onCheckedChange={(v) => updateTemplate("show_logo", v)}
                            />
                        </div>

                        {/* Header Text */}
                        <div>
                            <Label className="flex items-center gap-2">
                                <Type size={16} />
                                Header Text
                            </Label>
                            <Input
                                value={template.header_text}
                                onChange={(e) => updateTemplate("header_text", e.target.value)}
                                placeholder="Optional header message"
                                className="mt-1"
                            />
                        </div>

                        {/* Footer Text */}
                        <div>
                            <Label>Footer Text</Label>
                            <Input
                                value={template.footer_text}
                                onChange={(e) => updateTemplate("footer_text", e.target.value)}
                                placeholder="Thank you for your purchase!"
                                className="mt-1"
                            />
                        </div>

                        {/* Custom Message */}
                        <div>
                            <Label>Custom Message</Label>
                            <textarea
                                value={template.custom_message}
                                onChange={(e) => updateTemplate("custom_message", e.target.value)}
                                placeholder="Add a personalized note to your customers..."
                                className="w-full mt-1 p-3 border rounded-xl text-sm resize-none h-20"
                            />
                        </div>

                        {/* Social Links Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Link2 size={20} />
                                <div>
                                    <p className="font-bold text-sm">Show Social Links</p>
                                    <p className="text-xs text-muted-foreground">Include your social media links</p>
                                </div>
                            </div>
                            <Switch
                                checked={template.show_social_links}
                                onCheckedChange={(v) => updateTemplate("show_social_links", v)}
                            />
                        </div>

                        {/* Accent Color */}
                        <div>
                            <Label>Accent Color</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input
                                    type="color"
                                    value={template.accent_color}
                                    onChange={(e) => updateTemplate("accent_color", e.target.value)}
                                    className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                                />
                                <Input
                                    value={template.accent_color}
                                    onChange={(e) => updateTemplate("accent_color", e.target.value)}
                                    className="flex-1 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-12 font-bold"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : (
                            <Save className="mr-2" size={18} />
                        )}
                        {isSaving ? "Saving..." : "Save Template"}
                    </Button>
                </Container>

                {/* Preview */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-3">Preview</p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 rounded-2xl p-6 shadow-lg max-w-sm mx-auto"
                    >
                        {/* Logo */}
                        {template.show_logo && (
                            <div className="text-center mb-4">
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt={storeName}
                                        className="w-16 h-16 rounded-xl mx-auto object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center text-white font-black text-xl"
                                        style={{ backgroundColor: template.accent_color }}
                                    >
                                        {storeName.charAt(0)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Header */}
                        <div className="text-center">
                            <h3 className="font-black text-lg">{storeName}</h3>
                            {template.header_text && (
                                <p className="text-sm text-muted-foreground">{template.header_text}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-dashed my-4" style={{ borderColor: template.accent_color }} />

                        {/* Sample Items */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Product Name</span>
                                <span className="font-bold">5,000 XOF</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Qty: 1</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-dashed my-4" style={{ borderColor: template.accent_color }} />
                        <div className="flex justify-between font-black">
                            <span>Total</span>
                            <span style={{ color: template.accent_color }}>5,000 XOF</span>
                        </div>

                        {/* Custom Message */}
                        {template.custom_message && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-center">
                                {template.custom_message}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            {template.show_social_links && (
                                <div className="flex justify-center gap-3 mb-3">
                                    <Instagram size={16} className="text-muted-foreground" />
                                    <Smartphone size={16} className="text-muted-foreground" />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">{template.footer_text}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </FeatureGate>
    );
}

export default function ReceiptBuilderPage() {
    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="hero-text !text-3xl">Receipt Builder</h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Customize the receipts sent to your customers
                </p>
            </div>
            <ReceiptBuilder />
        </div>
    );
}
