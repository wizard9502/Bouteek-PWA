"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation"; // Correct hook for App Router
import Image from "next/image";

export default function CheckoutPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Form State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [placingOrder, setPlacingOrder] = useState(false);

    // Cart Data (Parsed from URL or LocalStorage in a real app, here simulated or simplified)
    // In a real refactor, we should use a Context or Zustand store.
    // For this migration, we'll assume the user passes cart data via query param or we read from localStorage if you had implemented it.
    // However, the previous implementation had cart in local state. 
    // FIX: I will read cart from localStorage for now to persist across page navigations if the user implements that, 
    // OR I will advise the user that this page expects a valid 'cart' session.
    // For simplicity in this step, I'll fetch the cart from localStorage key `bouteek_cart_${domain}` if it existed, 
    // but likely it doesn't. 
    // BETTER APPROACH: The user should pass the cart data. 
    // Since I cannot change the whole architecture to Context right now without breaking things,
    // I will implement the Checkout UI assuming the cart is passed via URL params (base64) or localStorage.
    // Let's use localStorage for persistence.

    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);

    useEffect(() => {
        // Hydrate Cart
        const storedCart = localStorage.getItem(`cart_${domain}`);
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        fetchStore(domain);
    }, [domain]);

    const fetchStore = async (encodedDomain: string) => {
        try {
            const identifier = decodeURIComponent(encodedDomain);
            let { data: merchant } = await supabase.from('merchants').select('*, storefronts(*)').eq('slug', identifier).single();

            if (!merchant) {
                setLoading(false);
                return;
            }

            setStore({ ...merchant, ...merchant.storefronts?.[0] });

            if (merchant.storefronts?.[0]?.id) {
                const { data: methods } = await supabase
                    .from('storefront_payment_methods')
                    .select('*')
                    .eq('storefront_id', merchant.storefronts[0].id)
                    .eq('is_active', true);
                setPaymentMethods(methods || []);
                if (methods && methods.length > 0) setSelectedMethod(methods[0].type);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId) {
            toast.error("Please enter the Transaction ID");
            return;
        }

        setPlacingOrder(true);
        try {
            const { data: result, error: rpcError } = await supabase.rpc('place_order', {
                merchant_id_input: store.id,
                customer_name_input: customerName,
                customer_phone_input: customerPhone,
                delivery_address_input: customerAddress,
                items_json: cart.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                })),
                subtotal_input: totalAmount,
                total_input: totalAmount,
                payment_method_input: selectedMethod,
                notes_input: `Trans ID: ${transactionId}`
            });

            if (rpcError) throw rpcError;
            if (!result.success) throw new Error(result.message);

            // Clear Cart
            localStorage.removeItem(`cart_${domain}`);
            toast.success("Order placed successfully!");

            // Redirect to success or back to store
            router.push(`/store/${domain}/success?orderId=${result.order_id}`);

        } catch (error: any) {
            toast.error("Failed: " + error.message);
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!store) return <div className="h-screen flex items-center justify-center">Store not found</div>;
    if (cart.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500">Your cart is empty.</p>
            <Button onClick={() => router.push(`/store/${domain}`)}>Back to Store</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="font-bold text-lg">Checkout for {store.business_name}</h1>
            </div>

            <div className="max-w-xl mx-auto w-full p-6 space-y-8 flex-1">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.quantity} x {item.product.name}</span>
                                <span className="font-medium">{item.product.price * item.quantity} XOF</span>
                            </div>
                        ))}
                        <div className="border-t pt-3 flex justify-between font-black text-lg">
                            <span>Total</span>
                            <span>{totalAmount.toLocaleString()} XOF</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-8">
                    {/* Customer Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">1</div>
                            <h2>Your Details</h2>
                        </div>
                        <div className="grid gap-3 pl-10">
                            <Input placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="h-12 bg-white" />
                            <Input placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="h-12 bg-white" />
                            <Input placeholder="Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required className="h-12 bg-white" />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">2</div>
                            <h2>Payment</h2>
                        </div>

                        <div className="pl-10 space-y-4">
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg flex gap-2">
                                <ShieldCheck className="text-blue-600 shrink-0" size={18} />
                                <span>Send money to the verified merchant number below, then enter the Transaction ID.</span>
                            </p>

                            {paymentMethods.length === 0 ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                    Merchant has not enabled payments.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <div
                                            key={method.id}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMethod === method.type ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            onClick={() => setSelectedMethod(method.type)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Fallback icons/images if assets missing */}
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${method.type === 'wave' ? 'bg-[#1da1f2] text-white' : 'bg-[#ff7900] text-black'}`}>
                                                    {method.type === 'wave' ? 'Wave' : 'OM'}
                                                </div>
                                                <div>
                                                    <p className="font-bold capitalize text-sm text-gray-500">{method.type.replace('_', ' ')}</p>
                                                    <p className="text-xl font-mono font-bold tracking-tight">{method.details?.phoneNumber}</p>
                                                </div>
                                            </div>
                                            {selectedMethod === method.type && <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center"><Check size={14} /></div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2">
                                <Label htmlFor="txId" className="mb-2 block font-medium">Transaction ID (Required)</Label>
                                <Input
                                    id="txId"
                                    placeholder="Paste SMS content or Trans ID here"
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    required
                                    className={`h-14 text-lg font-mono placeholder:font-sans transition-colors ${!transactionId ? 'border-red-200 focus-visible:ring-red-200' : 'border-green-200 focus-visible:ring-green-200'}`}
                                />
                                <p className="text-xs text-muted-foreground mt-2">Example: 'Trans: 123456... Payment to Bouteek'</p>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-black h-14 rounded-xl shadow-xl shadow-black/10 text-lg" disabled={placingOrder || !transactionId || paymentMethods.length === 0}>
                        {placingOrder ? <Loader2 className="animate-spin" /> : `Confirm Payment • ${totalAmount.toLocaleString()} XOF`}
                    </Button>
                </form>
            </div>
        </div>
    );
}
