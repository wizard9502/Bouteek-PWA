"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Globe,
    Search as SearchIcon,
    Flame,
    Users,
    Package,
    ChevronRight,
    ExternalLink,
    TicketPercent,
    MessageSquare,
    Printer,
    RefreshCcw,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";


export default function StorePage() {
    const { t, language } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [merchantSlug, setMerchantSlug] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id, slug').eq('user_id', user?.id).single();
            if (!merchant) return;

            setMerchantSlug(merchant.slug);

            const { data } = await supabase
                .from('listings')
                .select('*')
                .eq('store_id', merchant.id)
                .order('created_at', { ascending: false });

            setProducts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const advancedFeatures = [
        { title: t("growth.builder"), desc: t("growth.builder_desc"), icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/store/builder" },
        { title: t("growth.seo"), desc: t("growth.seo_desc"), icon: SearchIcon, color: "text-amber-500", bg: "bg-amber-500/10", href: "/dashboard/store/seo" },
        { title: t("growth.heatmaps"), desc: t("growth.heatmaps_desc"), icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", href: "/dashboard/store/heatmaps" },
        { title: t("growth.collaboration"), desc: t("growth.collaboration_desc"), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/store/collaboration" },
        { title: t("growth.inventory_sync"), desc: t("growth.inventory_sync_desc"), icon: RefreshCcw, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/dashboard/listings" },
        { title: t("growth.promotions"), desc: t("growth.promotions_desc"), icon: TicketPercent, color: "text-pink-500", bg: "bg-pink-500/10", href: "/dashboard/store/promotions" },
        { title: t("growth.reviews"), desc: t("growth.reviews_desc"), icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10", href: "/dashboard/store/reviews" },
        { title: t("growth.receipts"), desc: t("growth.receipts_desc"), icon: Printer, color: "text-cyan-500", bg: "bg-cyan-500/10", href: "/dashboard/store/receipts" },
    ];


    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{t("store.title")}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{t("store.subtitle")}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/listings/new">
                        <Button className="rounded-2xl bg-bouteek-green text-black font-bold h-12 px-6 shadow-lg shadow-bouteek-green/20">
                            <Plus className="mr-2" size={20} />
                            {t("store.add_product")}
                        </Button>
                    </Link>
                </div>

            </div>

            {/* Advanced Features */}
            <section className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">{t("store.growth_tools")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {advancedFeatures.map((feature, i) => (
                        <Link key={feature.title} href={feature.href}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bouteek-card p-6 flex items-start gap-4 hover:border-bouteek-green transition-all group"
                            >
                                <div className={cn("p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform", feature.bg, feature.color)}>
                                    <feature.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm">{feature.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{feature.desc}</p>
                                </div>
                                <ChevronRight className="text-muted-foreground/30 group-hover:text-bouteek-green transition-colors" size={20} />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Inventaire" : "Inventory"} ({products.length})</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder={language === 'fr' ? "Rechercher..." : "Search products..."}
                                className="pl-10 rounded-xl bg-card border-border/50 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl h-10 w-10 border-border/50"
                            onClick={() => toast.info('Advanced filtering coming soon')}
                        >
                            <Filter size={18} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center p-12 text-muted-foreground font-medium">No products found. Add your first item to start selling!</div>
                    ) : products.filter(p => (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bouteek-card overflow-hidden group"
                        >
                            <div className="aspect-square relative overflow-hidden bg-muted">
                                {(product.media_urls || product.images)?.length > 0 ? (
                                    <img
                                        src={(product.media_urls || product.images)[0]}
                                        alt={product.title || product.name}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package size={48} /></div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="rounded-full px-3 py-1 font-bold text-[10px] uppercase shadow-lg bg-black text-white">
                                        {product.module_type || 'sale'}
                                    </Badge>
                                    <Badge className={cn(
                                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase shadow-lg",
                                        (product.metadata?.stock_level || product.stock_quantity || 0) > 0 ? "bg-bouteek-green text-black" : "bg-red-500 text-white"
                                    )}>
                                        {(product.metadata?.stock_level || product.stock_quantity || 0) > 0 ? (language === 'fr' ? "En Stock" : "In Stock") : (language === 'fr' ? "Rupture" : "Out of Stock")}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h4 className="font-black text-lg line-clamp-1 group-hover:text-bouteek-green transition-colors">{product.title || product.name}</h4>
                                        <p className="text-muted-foreground text-sm mt-1">Stock: {product.metadata?.stock_level || product.stock_quantity || 0} units</p>
                                    </div>
                                    <p className="font-black text-xl whitespace-nowrap">{(product.base_price || product.price || 0).toLocaleString()} <span className="text-xs text-muted-foreground">XOF</span></p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-8">
                                    <Link href={`/dashboard/listings/${product.id}/edit`}>
                                        <Button variant="outline" className="rounded-2xl border-border/50 font-bold text-xs h-11 w-full">Edit</Button>
                                    </Link>
                                    <Button
                                        className="rounded-2xl bg-muted text-foreground font-bold text-xs h-11 hover:bg-red-500 hover:text-white transition-colors"
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to delete this listing?")) {
                                                const { error } = await supabase.from('listings').delete().eq('id', product.id);
                                                if (!error) {
                                                    setProducts(products.filter(p => p.id !== product.id));
                                                }
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        className="col-span-2 rounded-2xl bg-black text-white font-bold text-xs h-11 hover:bg-bouteek-green hover:text-white transition-colors"
                                        onClick={() => window.open(`/store/${merchantSlug}`, '_blank')}
                                    >
                                        View Site
                                        <ExternalLink size={14} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </section>
        </div>
    );
}
