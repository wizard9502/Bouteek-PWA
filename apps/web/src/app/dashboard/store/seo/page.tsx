"use client";

import { useState } from "react";
import {
    Search,
    Globe,
    Smartphone,
    Share2,
    Check,
    AlertCircle,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";


export default function SEOPage() {
    const { language } = useTranslation();
    const [config, setConfig] = useState({
        title: "",
        description: "",
        keywords: ""
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSEO();
    }, []);

    const fetchSEO = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: storefront } = await supabase
                .from('storefronts')
                .select('meta_title, meta_description, meta_keywords')
                .eq('user_id', user?.id)
                .single();

            if (storefront) {
                setConfig({
                    title: storefront.meta_title || "",
                    description: storefront.meta_description || "",
                    keywords: storefront.meta_keywords || ""
                });
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
                .update({
                    meta_title: config.title,
                    meta_description: config.description,
                    meta_keywords: config.keywords
                })
                .eq('user_id', user?.id);

            if (error) throw error;
            toast.success(language === 'fr' ? "Métadonnées enregistrées !" : "Metadata saved!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">{language === 'fr' ? "Optimisation SEO" : "SEO Optimization"}</h1>
                <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Optimisez votre boutique pour Google et les réseaux sociaux." : "Optimize your store for Google and social media visibility."}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <Card className="p-8 rounded-4xl border-border/50 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Page Title</Label>
                            <Input
                                className="h-14 rounded-2xl bg-muted/30 font-bold"
                                value={config.title}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                maxLength={60}
                            />
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-muted-foreground">Recommended: under 60 characters</span>
                                <span className={config.title.length > 60 ? "text-red-500" : "text-bouteek-green"}>{config.title.length}/60</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Description</Label>
                            <Textarea
                                className="min-h-[120px] rounded-2xl bg-muted/30 p-6"
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                maxLength={160}
                            />
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-muted-foreground">Recommended: under 160 characters</span>
                                <span className={config.description.length > 160 ? "text-red-500" : "text-bouteek-green"}>{config.description.length}/160</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px]"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : (language === 'fr' ? "Enregistrer les métadonnées" : "Save Meta Tags")}
                        </Button>
                    </Card>

                    <Card className="p-8 rounded-4xl border-border/50 space-y-6">
                        <h3 className="font-black flex items-center gap-3">
                            <Share2 className="text-bouteek-green" size={20} />
                            Social Metadata
                        </h3>
                        <p className="text-xs text-muted-foreground">Configure how your store looks when shared on WhatsApp, Facebook, or Twitter.</p>
                        <Button variant="outline" className="rounded-xl font-bold border-border/50">Edit OG Image</Button>
                    </Card>
                </div>

                {/* Right: Preview */}
                <div className="space-y-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Google Search Preview</p>
                    <div className="bg-white p-8 rounded-3xl border border-border shadow-xl space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><Globe size={12} className="text-gray-400" /></div>
                            <span className="text-xs text-gray-400">https://bouteek.com/store/your-shop</span>
                        </div>
                        <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer transition-all">{config.title}</h4>
                        <p className="text-sm text-[#4d5156] leading-relaxed">
                            {config.description}
                        </p>
                    </div>

                    <div className="bg-bouteek-green/5 p-8 rounded-4xl border border-bouteek-green/20 space-y-6">
                        <div className="flex items-center gap-4 text-bouteek-green">
                            <div className="p-2 rounded-xl bg-bouteek-green/10"><Smartphone size={24} /></div>
                            <h4 className="font-black">SEO Score: 92/100</h4>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold">
                                <Check size={16} className="text-bouteek-green" /> Title tags optimized
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold">
                                <Check size={16} className="text-bouteek-green" /> Fast mobile loading
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold">
                                <AlertCircle size={16} className="text-amber-500" /> Missing H1 tag on home page
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={className}>{children}</p>;
}
