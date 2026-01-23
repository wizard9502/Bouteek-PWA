"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, CreditCard, ShoppingBag, MapPin, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMerchantOrders } from "@/lib/adminData";

export default function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMerchantDetails();
    }, [id]);

    const fetchMerchantDetails = async () => {
        try {
            // Fetch Merchant Info
            const { data: m, error } = await supabase
                .from('merchants')
                .select('*, users(email), storefronts(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setMerchant(m);

            // Fetch Orders
            // Assuming we have a function or we fetch directly. 
            // Since getMerchantOrders might be for logged-in merchant, we might need an admin version or use RPC.
            // For now, let's try direct query if RLS allows, or use the lib function if it works for admin too.
            // Actually, getMerchantOrders usually filters by auth.uid(). Admin needs to select by merchant_id.

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('merchant_id', id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!orderError) {
                setOrders(orderData || []);
            }

        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!merchant) return <div className="p-20 text-center">Merchant not found</div>;

    return (
        <div className="p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black">{merchant.business_name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                        <span className="font-mono">{merchant.id}</span>
                        <Badge variant={merchant.is_verified ? "default" : "secondary"} className={merchant.is_verified ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                            {merchant.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        {merchant.is_banned && <Badge variant="destructive">Banned</Badge>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info Cards */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Store size={18} /> Business Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium">{merchant.users?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Phone</p>
                                    <p className="text-sm font-medium">{merchant.contact_phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Address</p>
                                    <p className="text-sm font-medium">{merchant.business_address || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Joined</p>
                                    <p className="text-sm font-medium">{new Date(merchant.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CreditCard size={18} /> Financials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/20 rounded-xl">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Wallet Balance</p>
                                <p className="text-2xl font-black mt-1">{merchant.bouteek_cash_balance?.toLocaleString()} XOF</p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Subscription Tier</p>
                                <p className="text-lg font-bold mt-1 uppercase">{merchant.subscription_tier}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Order History */}
                <div className="lg:col-span-2">
                    <Card className="rounded-3xl border-border/50 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag size={18} /> Recent Orders
                            </CardTitle>
                            <CardDescription>Last 50 transactions for this merchant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">ID</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 rounded-r-lg">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-muted-foreground">No orders found.</td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/5">
                                                    <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{order.customer_name}</div>
                                                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-bold">{order.total_amount?.toLocaleString()} XOF</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="uppercase text-[10px]">
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
