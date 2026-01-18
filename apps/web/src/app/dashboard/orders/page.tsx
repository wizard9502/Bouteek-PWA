"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
            if (!merchant) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*') // If order_items exist, join them here: select('*, order_items(*, product:products(*))')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error(error);
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

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Orders</h2>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="flex flex-row items-center justify-between py-4 bg-gray-50/50">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-base text-gray-500">Order #{order.id.slice(0, 8)}</CardTitle>
                                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className={order.status === 'paid' ? 'bg-[#00D632] text-black hover:bg-[#00D632]' : ''}>
                                    {order.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-sm mb-2 text-gray-500 uppercase">Customer</h4>
                                        <p className="font-medium">{order.metadata?.customer_name || "Guest"}</p>
                                        <p className="text-sm">{order.metadata?.customer_phone}</p>
                                        <p className="text-sm text-gray-500">{order.metadata?.address}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-2 text-gray-500 uppercase">Payment Details</h4>
                                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <p className="text-xs text-yellow-700 font-bold mb-1">MANUAL VERIFICATION REQUIRED</p>
                                            <p className="text-sm">Tx ID: <span className="font-mono font-bold">{order.metadata?.transaction_id}</span></p>
                                            <p className="text-sm">Provider: {order.metadata?.payment_provider}</p>
                                            <p className="text-lg font-bold mt-2">{order.total_amount} XOF</p>
                                        </div>
                                    </div>
                                </div>

                                {order.status === 'pending' && (
                                    <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                                        <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => updateStatus(order.id, 'cancelled')}>
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => updateStatus(order.id, 'paid')}>
                                            <CheckCircle className="mr-2 h-4 w-4 text-[#00D632]" /> Confirm Payment
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
