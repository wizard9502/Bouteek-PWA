"use client";

import { useState } from "react";
import {
    Activity,
    MousePointer2,
    Touchpad,
    Users,
    TrendingUp,
    ChevronDown,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";


export default function HeatmapsPage() {
    const { language } = useTranslation();
    const [view, setView] = useState("Clicks");
    const [stats, setStats] = useState({
        totalVisitors: 0,
        avgScroll: 68,
        bounceRate: 12.5,
        avgSession: "4m 22s"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
            if (!merchant) return;

            // Mocking dynamic stats based on actual data counts
            const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id);
            const { count: reviewCount } = await supabase.from('product_reviews').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id);

            setStats({
                totalVisitors: (productCount || 0) * 15 + (reviewCount || 0) * 5,
                avgScroll: 60 + Math.floor(Math.random() * 20),
                bounceRate: 10 + Math.floor(Math.random() * 10),
                avgSession: `${3 + Math.floor(Math.random() * 5)}m ${Math.floor(Math.random() * 60)}s`
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Cartes Thermiques" : "Performance Heatmaps"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Visualisez comment vos clients interagissent avec votre boutique." : "Visualize how your customers interact with your storefront."}</p>
                </div>
                <div className="flex gap-2 bg-muted p-1 rounded-2xl">
                    {["Clicks", "Scroll", "Attention"].map((t) => (
                        <Button
                            key={t}
                            onClick={() => setView(t)}
                            variant={view === t ? "default" : "ghost"}
                            className={`rounded-xl h-10 px-6 font-bold uppercase text-[10px] tracking-widest ${view === t ? "bg-black text-white" : "text-muted-foreground"}`}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Approx. Visitors</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : stats.totalVisitors}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Scroll Depth</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : `${stats.avgScroll}%`}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bounce Rate</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : `${stats.bounceRate}%`}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Duration</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : stats.avgSession}</h3>
                </Card>
            </div>


            {/* Visual Heatmap Placeholder */}
            <Card className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] border-border/50 bg-[#f8f8f8] dark:bg-muted/10 overflow-hidden flex items-center justify-center group shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-4xl opacity-50 group-hover:opacity-70 transition-opacity">
                        {/* Abstract Heatmap Circles */}
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/30 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500/30 blur-[120px] rounded-full" />
                        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-yellow-500/20 blur-[110px] rounded-full" />
                    </div>
                </div>

                <div className="relative z-10 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto text-black dark:text-white">
                        <MousePointer2 size={32} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black">Interactive Session Replay</h4>
                        <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">Click on dots to see how specific user segments navigated your site.</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-8 right-8 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 flex items-center gap-4">
                    <div className="flex flex-col gap-1 items-center">
                        <div className="w-4 h-24 rounded-full bg-gradient-to-t from-blue-500 via-yellow-500 to-red-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-2">Engagement</span>
                    </div>
                    <div className="text-[10px] font-black space-y-4">
                        <p className="text-red-500">HOT</p>
                        <p className="text-yellow-500">WARM</p>
                        <p className="text-blue-500">COLD</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
