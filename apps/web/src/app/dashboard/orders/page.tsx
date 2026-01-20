"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import {
    Loader2,
    CheckCircle,
    XCircle,
    Phone,
    Calendar,
    Package,
    ChevronRight,
    Clock,
    Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

interface Order {
    id: string;
    order_number?: string;
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    items: any[];
    total: number;
    total_amount?: number;
    status: string;
    transaction_id?: string;
    payment_method?: string;
    created_at: string;
}

export default function OrdersPage() {
    return (
        <TranslationProvider>
            <OrdersPageContent />
        </TranslationProvider>
    );
}

function OrdersPageContent() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [merchantId, setMerchantId] = useState<number | null>(null);
    const [storeName, setStoreName] = useState("Your Store");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Realtime subscription for new orders
    useRealtimeOrders({
        merchantId,
        playSound: true,
        onNewOrder: (newOrder) => {
            setOrders(prev => [newOrder, ...prev]);
            toast.success("New order received!", {
                icon: <Bell className="text-bouteek-green" />,
            });
        },
        onOrderUpdate: (updatedOrder) => {
            setOrders(prev =>
                prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            );
        },
    });

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from('merchants')
                .select('id, businessName')
                .eq('userId', user.id)
                .single();

            if (!merchant) return;

            setMerchantId(merchant.id);
            setStoreName(merchant.businessName || "Your Store");

            let query = supabase
                .from('orders')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            if (activeTab !== "all") {
                if (activeTab === "pending_verification") {
                    query = query.in('status', ['pending', 'pending_verification']);
                } else {
                    query = query.eq('status', activeTab);
                }
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
            let error;
            if (status === 'paid') {
                // Use RPC to deduct commission and log transaction
                const { error: rpcError } = await supabase.rpc('confirm_order', { order_id_input: orderId });
                error = rpcError;
            } else {
                // Direct update for other statuses
                const { error: updateError } = await supabase.from('orders').update({ status }).eq('id', orderId);
                error = updateError;
            }

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status } : o
            ));

            toast.success(`Order marked as ${status}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update status");
            throw error;
        }
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const getTimeElapsed = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffHours > 0) return `${diffHours}h ago`;
        return `${diffMins}m ago`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-bouteek-green text-black';
            case 'pending':
            case 'pending_verification':
                return 'bg-amber-100 text-amber-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            case 'processing':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const tabs = [
        { id: "all", label: t("orders.tabs.all") || "All" },
        { id: "pending_verification", label: "Pending Verification" },
        { id: "processing", label: "Processing" },
        { id: "completed", label: t("orders.tabs.completed") || "Completed" },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="hero-text !text-4xl">{t("orders.title") || "Orders"}</h1>
                <p className="text-muted-foreground font-medium mt-1">
                    {t("orders.subtitle") || "Manage incoming orders and payments"}
                </p>
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
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest animate-pulse">
                        Syncing Orders...
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bouteek-card p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-4xl bg-muted flex items-center justify-center text-muted-foreground">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="text-xl font-black">
                            No {activeTab !== 'all' ? activeTab.replace('_', ' ') : ''} orders found.
                        </p>
                        <p className="text-muted-foreground mt-1">
                            New orders will appear here automatically.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => handleOrderClick(order)}
                                className="bouteek-card p-5 cursor-pointer group hover:border-bouteek-green/50 hover:shadow-lg hover:shadow-bouteek-green/10 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-lg">
                                            #{order.order_number || order.id.slice(0, 8)}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Clock size={12} />
                                            {getTimeElapsed(order.created_at)}
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase",
                                        getStatusColor(order.status)
                                    )}>
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                {/* Customer */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                                        {(order.customer_name || "G")[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">
                                            {order.customer_name || "Guest User"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {order.customer_phone || "No phone"}
                                        </p>
                                    </div>
                                </div>

                                {/* Transaction ID highlight for pending verification */}
                                {order.transaction_id && (order.status === 'pending' || order.status === 'pending_verification') && (
                                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                        <p className="text-[10px] font-bold uppercase text-amber-600">Transaction ID</p>
                                        <p className="font-mono font-bold text-sm truncate">{order.transaction_id}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Total</p>
                                        <p className="font-black text-lg">
                                            {(order.total || order.total_amount || 0).toLocaleString()}
                                            <span className="text-xs text-muted-foreground ml-1">XOF</span>
                                        </p>
                                    </div>
                                    <ChevronRight
                                        size={20}
                                        className="text-muted-foreground group-hover:text-bouteek-green group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Order Detail Slide-over */}
            <OrderDetailView
                order={selectedOrder}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedOrder(null);
                }}
                onStatusUpdate={updateStatus}
                storeName={storeName}
            />
        </div>
    );
}
