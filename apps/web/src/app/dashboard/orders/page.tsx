"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Loader2,
    CheckCircle,
    XCircle,
    Phone,
    Calendar,
    Package,
    ChevronRight,
    Search,
    Filter,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

export default function OrdersPage() {
    return (
        <TranslationProvider>
            <OrdersPageContent />
        </TranslationProvider>
    );
}

function OrdersPageContent() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
            if (!merchant) return;

            let query = supabase
                .from('orders')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            if (activeTab !== "all") {
                query = query.eq('status', activeTab);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
            if (error) throw error;
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const tabs = [
        { id: "all", label: t("orders.tabs.all") },
        { id: "pending", label: t("orders.tabs.pending") },
        { id: "paid", label: t("orders.tabs.paid") },
        { id: "completed", label: t("orders.tabs.completed") },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">{t("orders.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">{t("orders.subtitle")}</p>
            </div>

            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
                            activeTab === tab.id
                                ? "bg-bouteek-green text-black border-bouteek-green shadow-lg shadow-bouteek-green/20"
                                : "bg-card text-muted-foreground border-border/50 hover:border-bouteek-green/50"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-bouteek-green/20 border-t-bouteek-green animate-spin" />
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bouteek-card p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-4xl bg-muted flex items-center justify-center text-muted-foreground">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="text-xl font-black">No {activeTab !== 'all' ? activeTab : ''} orders found.</p>
                        <p className="text-muted-foreground mt-1">Sit tight! New orders will appear here automatically.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bouteek-card overflow-hidden group hover:border-bouteek-green/30"
                        >
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                {/* Order Info Segment */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-xl">#{order.order_number || order.id.slice(0, 8)}</h3>
                                                <Badge className={cn(
                                                    "rounded-full px-3 py-1 font-bold text-[10px] uppercase",
                                                    order.status === 'paid' ? 'bg-bouteek-green text-black' : 'bg-muted text-muted-foreground'
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium mt-2">
                                                <Calendar size={14} />
                                                {new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black">{order.total || order.total_amount} <span className="text-xs text-muted-foreground">XOF</span></p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Total Amount</p>
                                        </div>
                                    </div>

                                    {/* Customer Snippet */}
                                    <div className="p-4 rounded-2xl bg-muted/50 flex items-center justify-between group/customer cursor-pointer hover:bg-bouteek-green/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-black text-bouteek-green border border-border/50">
                                                {(order.customer_name || "G")[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm">{order.customer_name || "Guest User"}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                                                    <Phone size={12} />
                                                    {order.customer_phone || "No phone"}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-muted-foreground group-hover/customer:translate-x-1 group-hover/customer:text-bouteek-green transition-all" />
                                    </div>

                                    {/* Item Breakdown (Nested) */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Items</p>
                                        {(order.items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center font-bold text-[10px]">{item.quantity}x</span>
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-muted-foreground">{item.price} XOF</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Vertical Divider (Desktop Only) */}
                                <div className="hidden md:block w-px bg-border/50" />

                                {/* Timeline & Actions Region */}
                                <div className="w-full md:w-80 flex flex-col justify-between gap-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timeline Segment</p>
                                        <div className="space-y-4 relative pl-6 border-l border-border/50">
                                            <div className="relative">
                                                <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-bouteek-green shadow-[0_0_10px_rgba(0,214,50,0.5)]" />
                                                <p className="text-xs font-black">Order Received</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</p>
                                            </div>
                                            {order.status !== 'pending' && (
                                                <div className="relative">
                                                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-bouteek-green" />
                                                    <p className="text-xs font-black">Payment Confirmed</p>
                                                    <p className="text-[10px] text-muted-foreground">Automated entry</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {order.status === 'pending' ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-2xl border-border/50 font-black text-[10px] uppercase h-12 text-red-500 hover:bg-red-50"
                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                >
                                                    <XCircle className="mr-2" size={16} />
                                                    Reject
                                                </Button>
                                                <div className="flex flex-col gap-1 w-full">
                                                    <Button
                                                        className="rounded-2xl bg-black text-white font-black text-[10px] uppercase h-12 shadow-xl shadow-black/20 w-full"
                                                        onClick={() => updateStatus(order.id, 'paid')}
                                                    >
                                                        <CheckCircle className="mr-2 text-bouteek-green" size={16} />
                                                        Confirm
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <Button
                                                className="col-span-2 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase h-12 hover:bg-bouteek-green hover:text-white transition-all shadow-lg"
                                                onClick={() => updateStatus(order.id, 'completed')}
                                            >
                                                <Package className="mr-2" size={16} />
                                                Mark as Completed
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

