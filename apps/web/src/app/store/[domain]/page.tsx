"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart, Phone, Check, Loader2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { supabase } from "@/lib/supabaseClient";

export default function StorePage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params);
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);


    useEffect(() => {
        fetchStore(domain);
    }, [domain]);

    const fetchStore = async (encodedDomain: string) => {
        try {
            const identifier = decodeURIComponent(encodedDomain);

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

            // Fetch Listings (products, rentals, services)
            const { data: prods } = await supabase
                .from('listings')
                .select('*')
                .eq('store_id', merchant.id)
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

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Navigate to Checkout
    const proceedToCheckout = () => {
        // Persist cart for the checkout page
        localStorage.setItem(`cart_${domain}`, JSON.stringify(cart));
        setIsCartOpen(false);
        // Navigate
        window.location.href = `/store/${domain}/checkout`;
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
                        <span className="absolute -top-2 -right-2 bg-[#00FF41] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
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
                            {product.images && product.images.length > 0 && (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="p-3 flex-1">
                            <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                            <p className="text-gray-500 text-xs mt-1">{product.price} XOF</p>
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
                                        <p className="text-sm text-gray-500">{item.quantity} x {item.product.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{item.quantity * item.product.price}</span>
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
                            <Button className="w-full bg-[#00FF41] text-black font-bold h-12" onClick={proceedToCheckout}>
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
