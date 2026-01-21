"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle, Package, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderSuccessPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const orderId = new URLSearchParams(window.location.search).get('orderId');
        if (orderId) {
            fetchOrderDetails(orderId);
        } else {
            setLoading(false);
        }
    }, [domain]);

    const fetchOrderDetails = async (orderId: string) => {
        try {
            const { data: orderData, error } = await supabase
                .from('orders')
                .select('*, merchants(business_name, contact_phone, whatsapp)')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            setOrder(orderData);
            setStore(orderData.merchants);
        } catch (err) {
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 mb-4">Order not found</p>
                <Button onClick={() => router.push(`/store/${domain}`)}>
                    Return to Store
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
            {/* Header */}
            <header className="p-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/store/${domain}`)}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-bold">Order Confirmation</h1>
            </header>

            {/* Success Animation */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-green-500" />
                </div>

                <h2 className="text-3xl font-black mb-2">Order Placed! 🎉</h2>
                <p className="text-gray-600 mb-8 max-w-sm">
                    Thank you for your purchase. The merchant will verify your payment and process your order.
                </p>

                {/* Order Details Card */}
                <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 text-left space-y-4 border border-gray-100">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Order Number</p>
                            <p className="font-mono font-bold text-lg">{order.order_number}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className="font-bold text-yellow-600 uppercase">{order.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total</span>
                            <span className="font-black text-lg">{order.total?.toLocaleString()} XOF</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Items</span>
                            <span className="font-medium">{order.items?.length || 0} item(s)</span>
                        </div>
                    </div>

                    {/* Contact Merchant */}
                    {store && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-3">Contact Merchant</p>
                            <div className="flex gap-2">
                                {store.contact_phone && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => window.open(`tel:${store.contact_phone}`, '_self')}
                                    >
                                        <Phone size={16} className="mr-2" />
                                        Call
                                    </Button>
                                )}
                                {store.whatsapp && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                        onClick={() => window.open(`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, I just placed order ${order.order_number}`, '_blank')}
                                    >
                                        <MessageCircle size={16} className="mr-2" />
                                        WhatsApp
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Continue Shopping */}
                <div className="mt-8 space-y-3 w-full max-w-md">
                    <Button
                        className="w-full h-14 bg-black text-white font-bold rounded-2xl"
                        onClick={() => router.push(`/store/${domain}`)}
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-6 text-center">
                <p className="text-xs text-gray-400">
                    Powered by <span className="font-bold text-[#00FF41]">Bouteek</span>
                </p>
            </footer>
        </div>
    );
}
