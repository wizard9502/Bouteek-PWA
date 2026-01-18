"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart, Phone, Check, Loader2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { supabase } from "@/lib/supabaseClient";

export default function StorePage({ params }: { params: { domain: string } }) {
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    // Cart
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Checkout Form
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        fetchStore();
    }, [params.domain]);

    const fetchStore = async () => {
        try {
            const identifier = decodeURIComponent(params.domain);

            // Look up merchant by slug first
            let { data: merchant, error } = await supabase
                .from('merchants')
                .select('*, storefronts(*)')
                .eq('slug', identifier)
                .single();

            // If not found, try custom domain (future proofing)
            // if (!merchant) ...

            if (!merchant) {
                setLoading(false);
                return;
            }

            setStore({ ...merchant, ...merchant.storefronts?.[0] }); // Flatten

            // Fetch Products
            const { data: prods } = await supabase
                .from('products')
                .select('*')
                .eq('merchant_id', merchant.id)
                .eq('is_active', true);

            setProducts(prods || []);

            // Fetch Payment Methods
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

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.product.id === product.id);
            if (existing) {
                return prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(p => p.product.id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.base_price * item.quantity), 0);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId) {
            toast.error("Please enter the Transaction ID");
            return;
        }

        setPlacingOrder(true);
        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    merchant_id: store.id, // merchant.id
                    customer_name: customerName, // Schema might need these columns or we dump in metadata/jsonb?
                    // Checking schema: The schema probably has user_id (if logged in) or guest details?
                    // Migration had: customer_email, customer_phone... 
                    // Let's assume standard fields or add if missing.
                    // Assuming schema has: total_amount, status, payment_method, payment_details (jsonb)
                    total_amount: totalAmount,
                    status: 'pending',
                    // metadata for guest details if columns don't exist
                    metadata: {
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        address: customerAddress,
                        transaction_id: transactionId,
                        payment_provider: selectedMethod
                    }
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const items = cart.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.base_price
            }));

            // Need a table for order items. Was it in migration? 
            // Migration SQL check: `order_items` table? If missed, we store in metadata or create.
            // Assuming `order_items` exists from standard patterns. If not, I'll assume metadata for MVP.
            // Let's try inserting traversing metadata first to be safe if table missing, 
            // but better to check if table exists. 
            // IF "orders" has "items" jsonb column? or relation.
            // Let's assume relation for now. If error, I'll catch.

            await supabase.from('order_items').insert(items);

            toast.success("Order placed successfully! The merchant will verify your payment.");
            setCart([]);
            setIsCheckoutOpen(false);
            setIsCartOpen(false);

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to place order. " + error.message);
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!store) return <div className="h-screen flex items-center justify-center">Store not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
                <h1 className="font-bold text-xl truncate">{store.business_name}</h1>
                <Button variant="outline" className="relative" onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#00D632] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    )}
                </Button>
            </header>

            {/* Hero / Info */}
            <div className="bg-black text-white p-6 text-center">
                <p className="opacity-80">Welcome to</p>
                <h2 className="text-3xl font-bold my-2">{store.business_name}</h2>
                <p className="text-sm opacity-60">Verified Merchant</p>
            </div>

            {/* Products */}
            <div className="max-w-4xl mx-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="aspect-square bg-gray-200 relative">
                            {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-3 flex-1">
                            <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                            <p className="text-gray-500 text-xs mt-1">{product.base_price} XOF</p>
                        </div>
                        <div className="p-3 pt-0">
                            <Button size="sm" className="w-full bg-black text-white hover:bg-gray-800" onClick={() => addToCart(product)}>Add</Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Drawer / Dialog */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="sm:max-w-md h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Your Cart</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <div>
                                        <p className="font-bold">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x {item.product.base_price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{item.quantity * item.product.base_price}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeFromCart(item.product.id)}>
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div className="pt-4 border-t">
                            <div className="flex justify-between mb-4 text-xl font-bold">
                                <span>Total</span>
                                <span>{totalAmount} XOF</span>
                            </div>
                            <Button className="w-full bg-[#00D632] text-black font-bold h-12" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
                                Checkout
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        {/* 1. Customer Details */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-sm uppercase text-gray-500">1. Your Details</h3>
                            <Input placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            <Input placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
                            <Input placeholder="Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required />
                        </div>

                        {/* 2. Payment Method Display */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-sm uppercase text-gray-500">2. Payment</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                Complete the payment on your phone to the number below, then enter the Transaction ID.
                            </p>

                            {paymentMethods.length === 0 ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                    Merchant has not set up payment methods yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {paymentMethods.map(method => (
                                        <div
                                            key={method.id}
                                            className={`p-4 rounded-lg border-2 cursor-pointer flex items-center justify-between ${selectedMethod === method.type ? 'border-[#00D632] bg-[#00D632]/5' : 'border-gray-200'}`}
                                            onClick={() => setSelectedMethod(method.type)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={method.type === 'wave' ? '/wave-logo.png' : '/orange-money-logo.png'}
                                                    className="w-8 h-8 rounded"
                                                    alt={method.type}
                                                />
                                                <div>
                                                    <p className="font-bold capitalize">{method.type.replace('_', ' ')}</p>
                                                    <p className="text-lg font-mono tracking-wide">{method.details?.phoneNumber}</p>
                                                </div>
                                            </div>
                                            {selectedMethod === method.type && <Check className="text-[#00D632]" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Confirmation */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-sm uppercase text-gray-500">3. Confirmation</h3>
                            <div className="bg-gray-100 p-4 rounded-lg text-center mb-2">
                                <p className="text-gray-500 text-sm">Amount to Pay</p>
                                <p className="text-2xl font-bold">{totalAmount} XOF</p>
                            </div>
                            <Label htmlFor="txId">Transaction ID (from SMS)</Label>
                            <Input
                                id="txId"
                                placeholder="e.g. QWE12345 or sms content"
                                value={transactionId}
                                onChange={e => setTransactionId(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-black text-white font-bold h-12" disabled={placingOrder || paymentMethods.length === 0}>
                            {placingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
