"use client";

import { useState } from "react";
import {
    Layout,
    Type,
    Image as ImageIcon,
    Link,
    Eye,
    Check,
    Smartphone,
    Printer,
    Download,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";


export default function ReceiptBuilderPage() {
    const { language } = useTranslation();
    const [config, setConfig] = useState({
        showLogo: true,
        showQRCode: true,
        showSocial: true,
        customMessage: "Merci de votre achat !",
        accentColor: "#00D632"
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: storefront } = await supabase
                .from('storefronts')
                .select('receipt_config')
                .eq('user_id', user?.id)
                .single();

            if (storefront?.receipt_config) {
                setConfig(storefront.receipt_config);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('storefronts')
                .update({ receipt_config: config })
                .eq('user_id', user?.id);

            if (error) throw error;
            toast.success(language === 'fr' ? "Configuration enregistrée !" : "Configuration saved!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Reçus Numériques" : "Digital Receipts"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Personnalisez vos reçus de vente." : "Customize your branded sales receipts."}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/50 font-bold">
                        <Download className="mr-2" size={18} />
                        Export PDF
                    </Button>
                    <Button className="rounded-2xl bg-bouteek-green text-black font-bold h-12 px-8" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : (language === 'fr' ? "Enregistrer" : "Save Changes")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Customizer */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-4xl border-border/50 space-y-10">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{language === 'fr' ? "Éléments visuels" : "Visual Elements"}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-background text-muted-foreground"><ImageIcon size={18} /></div>
                                        <span className="font-bold text-sm">{language === 'fr' ? "Afficher le Logo" : "Show Logo"}</span>
                                    </div>
                                    <Switch checked={config.showLogo} onCheckedChange={(c) => setConfig({ ...config, showLogo: c })} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-background text-muted-foreground"><Link size={18} /></div>
                                        <span className="font-bold text-sm">QR Code (Web Link)</span>
                                    </div>
                                    <Switch checked={config.showQRCode} onCheckedChange={(c) => setConfig({ ...config, showQRCode: c })} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-background text-muted-foreground"><Layout size={18} /></div>
                                        <span className="font-bold text-sm">{language === 'fr' ? "Liens Sociaux" : "Social Links"}</span>
                                    </div>
                                    <Switch checked={config.showSocial} onCheckedChange={(c) => setConfig({ ...config, showSocial: c })} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Custom Message</h3>
                            <Input
                                className="h-14 rounded-2xl bg-muted/30 font-bold"
                                value={config.customMessage}
                                onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                            />
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Accent Color</h3>
                            <div className="flex gap-4">
                                {["#00D632", "#000000", "#FF4B4B", "#4B77FF"].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setConfig({ ...config, accentColor: color })}
                                        className={`w-12 h-12 rounded-full border-4 transition-all ${config.accentColor === color ? "border-muted scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </section>
                    </Card>
                </div>

                {/* Right: Live Preview */}
                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Live Mobile Preview</p>
                    <div className="w-[360px] h-[640px] bg-white rounded-[3rem] border-[8px] border-black shadow-2xl relative overflow-hidden flex flex-col p-8 text-black">
                        {/* Mock Receipt Content */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            {config.showLogo && (
                                <div className="w-16 h-16 rounded-2xl bg-[#00D632] flex items-center justify-center p-2">
                                    <img src="/bouteek-logo.jpg" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="space-y-1">
                                <h4 className="font-black text-xl">Bouteek Store</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Dakar, Senegal</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-dashed border-gray-200 space-y-4">
                            <div className="flex justify-between items-center font-bold">
                                <span>Premium Leather Bag</span>
                                <span>45,000 XOF</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Subtotal</span>
                                <span>45,000 XOF</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Tax (0%)</span>
                                <span>0 XOF</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-black pt-4" style={{ color: config.accentColor }}>
                                <span>Total</span>
                                <span>45,000 XOF</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center text-center gap-4">
                            <p className="text-xs font-bold italic">"{config.customMessage}"</p>

                            {config.showQRCode && (
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bouteek.com" className="w-16 h-16" />
                                </div>
                            )}

                            {config.showSocial && (
                                <div className="flex gap-4 text-gray-400 mt-2">
                                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"><Link size={14} /></div>
                                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"><ImageIcon size={14} /></div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto text-center">
                            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">Thank you for shopping local</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                <span className="text-[10px] font-black italic">Bouteek</span>
                                <div className="w-1 h-1 rounded-full bg-[#00D632]" />
                                <span className="text-[10px] font-bold">Payments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
