"use client";

import { useState, useEffect } from "react";
import {
    MousePointer2,
    Users,
    TrendingUp,
    Clock,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";

export default function HeatmapsPage() {
    const { language } = useTranslation();
    const [view, setView] = useState("Clicks");
    const [stats, setStats] = useState({
        totalVisitors: 0,
        avgScroll: 0,
        bounceRate: 0,
        avgSession: "0m 0s"
    });
    const [points, setPoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionTier, setSubscriptionTier] = useState("starter");

    useEffect(() => {
        fetchRealData();
    }, [view]);

    const fetchRealData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id, subscription_tier').eq('user_id', user?.id).single();
            if (!merchant) return;
            setSubscriptionTier(merchant.subscription_tier || "starter");

            if (merchant.subscription_tier === "starter") {
                setLoading(false);
                return;
            }

            // Fetch real analytics events
            const { data: events, error } = await supabase
                .from('analytics_events')
                .select('*')
                .eq('merchant_id', merchant.id)
                .limit(1000); // visualize last 1000 interactions

            if (error) throw error;

            const clickEvents = events?.filter(e => e.event_type === 'click') || [];

            // Calculate real stats from events (if we had session data, simplified here)
            const uniqueVisitors = new Set(events?.map(e => e.session_id || 'unknown')).size;

            setStats({
                totalVisitors: uniqueVisitors || 0,
                avgScroll: 0, // Placeholder as we need scroll tracking events
                bounceRate: 0, // Placeholder
                avgSession: "0m 0s"
            });

            setPoints(clickEvents.map(e => ({ x: e.x_coord, y: e.y_coord })));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (subscriptionTier === "starter") {
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                    <TrendingUp size={40} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter">Growth Feature</h2>
                <p className="text-muted-foreground mt-2 max-w-sm font-medium">
                    Heatmaps and advanced analytics are only available on Growth and Pro plans.
                </p>
                <Button 
                    className="mt-8 h-12 px-8 rounded-2xl bg-black text-white font-bold"
                    onClick={() => window.location.href = '/dashboard/finance'}
                >
                    Upgrade Now
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Cartes Thermiques" : "Performance Heatmaps"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Données réelles basées sur les interactions utilisateurs." : "Real data based on actual user interactions."}</p>
                </div>
                <div className="flex gap-2 bg-muted p-1 rounded-2xl">
                    {["Clicks", "Scroll"].map((t) => (
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Events</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : points.length}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Visitors</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : stats.totalVisitors}</h3>
                </Card>
            </div>

            {/* Visual Heatmap Container */}
            <Card className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] border-border/50 bg-[#f8f8f8] dark:bg-muted/10 overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : points.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <MousePointer2 className="text-muted-foreground mb-4" size={48} />
                        <h4 className="text-xl font-black">No Data Yet</h4>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Once customers start clicking on your storefront, their interactions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        {points.map((p, i) => (
                            <div
                                key={i}
                                className="absolute w-4 h-4 rounded-full bg-red-500/50 blur-sm"
                                style={{ left: `${p.x}px`, top: `${p.y}px` }}
                            />
                        ))}
                    </div>
                )}

                {/* Overlay UI */}
                <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-black/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Live View • {view}</p>
                </div>
            </Card>
        </div>
    );
}
