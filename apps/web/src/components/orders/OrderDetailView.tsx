"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContactCustomer } from "@/hooks/useContactCustomer";
import {
    X,
    Phone,
    MessageSquare,
    Copy,
    CheckCircle,
    XCircle,
    Package,
    MapPin,
    Clock,
    CreditCard,
    Loader2,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

// WhatsApp icon as inline SVG
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    order_number?: string;
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    items: OrderItem[];
    total: number;
    total_amount?: number;
    status: string;
    transaction_id?: string;
    payment_method?: string;
    created_at: string;
}

interface OrderDetailViewProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (orderId: string, status: string) => Promise<void>;
    storeName?: string;
}

/**
 * Slide-over panel showing full order details with customer communication
 * and payment verification controls.
 */
export function OrderDetailView({
    order,
    isOpen,
    onClose,
    onStatusUpdate,
    storeName = "Your Store",
}: OrderDetailViewProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const { call, sendSms, sendWhatsApp, copyPhone, hasPhone } = useContactCustomer(
        { name: order?.customer_name || "", phone: order?.customer_phone || "" },
        { orderId: order?.id || "", storeName }
    );

    if (!order) return null;

    const handleApprove = async () => {
        setIsUpdating(true);
        try {
            await onStatusUpdate(order.id, "paid");
            toast.success("Payment approved!");
            onClose();
        } catch (error) {
            toast.error("Failed to approve payment");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReject = async (reason: string) => {
        setIsUpdating(true);
        try {
            // Update status to cancelled with rejection reason
            await supabase
                .from("orders")
                .update({
                    status: "cancelled",
                    notes: `Rejected: ${reason}`,
                })
                .eq("id", order.id);

            toast.success("Order rejected");
            setShowRejectModal(false);
            onClose();
        } catch (error) {
            toast.error("Failed to reject order");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCopyAddress = async () => {
        if (order.customer_address) {
            await navigator.clipboard.writeText(order.customer_address);
            toast.success("Address copied!");
        }
    };

    const handleCopyPhone = async () => {
        const success = await copyPhone();
        if (success) toast.success("Phone copied!");
    };

    const getTimeElapsed = () => {
        const created = new Date(order.created_at);
        const now = new Date();
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return `${diffMins}m ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-black text-xl">
                                    Order #{order.order_number || order.id.slice(0, 8)}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={cn(
                                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase",
                                        order.status === "paid" ? "bg-bouteek-green text-black" :
                                            order.status === "pending" || order.status === "pending_verification" ? "bg-amber-100 text-amber-700" :
                                                order.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                    "bg-muted text-muted-foreground"
                                    )}>
                                        {order.status.replace("_", " ")}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={12} />
                                        {getTimeElapsed()}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X size={24} />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info Section */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Customer Information
                                </p>
                                <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-bouteek-green/10 flex items-center justify-center font-black text-bouteek-green text-lg">
                                                {order.customer_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold">{order.customer_name}</p>
                                                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={handleCopyPhone}>
                                            <Copy size={16} />
                                        </Button>
                                    </div>

                                    {order.customer_address && (
                                        <div className="flex items-start justify-between pt-3 border-t border-border/50">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                                <p className="text-sm">{order.customer_address}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                                                <Copy size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Communication Buttons */}
                                {hasPhone && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl h-12 font-bold text-xs"
                                            onClick={call}
                                        >
                                            <Phone size={16} className="mr-2" />
                                            Call
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl h-12 font-bold text-xs"
                                            onClick={sendSms}
                                        >
                                            <MessageSquare size={16} className="mr-2" />
                                            SMS
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl h-12 font-bold text-xs text-green-600 border-green-200 hover:bg-green-50"
                                            onClick={sendWhatsApp}
                                        >
                                            <WhatsAppIcon size={16} />
                                            <span className="ml-2">WhatsApp</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Order Items
                                </p>
                                <div className="space-y-3">
                                    {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-14 h-14 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                                                    <Package size={20} className="text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold">{item.price.toLocaleString()} XOF</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="font-bold">Total</span>
                                    <span className="text-xl font-black">
                                        {(order.total || order.total_amount || 0).toLocaleString()} XOF
                                    </span>
                                </div>
                            </div>

                            {/* Payment Verification */}
                            {order.transaction_id && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Payment Proof
                                    </p>
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="text-amber-600" size={24} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-amber-600">
                                                    Transaction ID
                                                </p>
                                                <p className="font-mono font-bold text-lg">{order.transaction_id}</p>
                                            </div>
                                        </div>
                                        {order.payment_method && (
                                            <p className="text-sm text-amber-700 mt-2">
                                                via {order.payment_method}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {(order.status === "pending" || order.status === "pending_verification") && (
                                <div className="space-y-3 pt-4 border-t">
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-bouteek-green text-black font-black text-sm"
                                        onClick={handleApprove}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                        ) : (
                                            <CheckCircle className="mr-2" size={20} />
                                        )}
                                        Approve Payment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-2xl font-bold text-xs border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={isUpdating}
                                    >
                                        <XCircle className="mr-2" size={18} />
                                        Reject Payment
                                    </Button>
                                </div>
                            )}

                            {order.status === "paid" && (
                                <div className="pt-4 border-t">
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-black text-white font-black text-sm"
                                        onClick={() => onStatusUpdate(order.id, "completed")}
                                        disabled={isUpdating}
                                    >
                                        <Package className="mr-2" size={20} />
                                        Mark as Completed
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Rejection Reason Modal */}
                    <AnimatePresence>
                        {showRejectModal && (
                            <RejectReasonModal
                                onReject={handleReject}
                                onClose={() => setShowRejectModal(false)}
                                isLoading={isUpdating}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}

interface RejectReasonModalProps {
    onReject: (reason: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

function RejectReasonModal({ onReject, onClose, isLoading }: RejectReasonModalProps) {
    const reasons = [
        "Incorrect Transaction ID",
        "Amount Mismatch",
        "Duplicate Payment",
        "Fraudulent Transaction",
        "Customer Request",
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6"
            >
                <h3 className="font-black text-lg mb-4">Rejection Reason</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Select a reason for rejecting this payment:
                </p>
                <div className="space-y-2">
                    {reasons.map((reason) => (
                        <button
                            key={reason}
                            onClick={() => onReject(reason)}
                            disabled={isLoading}
                            className="w-full p-4 text-left rounded-xl border border-border hover:border-red-300 hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                            {reason}
                        </button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </motion.div>
        </motion.div>
    );
}
