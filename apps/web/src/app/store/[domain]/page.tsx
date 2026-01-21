"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BlockRenderer } from "@/components/blocks";
import { Block } from "@/lib/blocks/types";
import { Loader2, ShoppingCart, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

export default function StorePage({ params }: { params: Promise<{ domain: string }> }) {
    return (
        <TranslationProvider>
            <StorePageContent params={params} />
        </TranslationProvider>
    );
}

function StorePageContent({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = use(params);
    const { t } = useTranslation();
    const [store, setStore] = useState<any>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart state
    const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        fetchStore(domain);
    }, [domain]);

    const fetchStore = async (encodedDomain: string) => {
        try {
            const identifier = decodeURIComponent(encodedDomain);

            // Lookup merchant by slug
            let { data: merchant, error } = await supabase
                .from("merchants")
                .select("*, storefronts(*)")
                .eq("slug", identifier)
                .single();

            if (!merchant) {
                setLoading(false);
                return;
            }

            const storefront = merchant.storefronts?.[0];
            setStore({ ...merchant, ...storefront });

            // Load layout blocks
            if (storefront?.layout_blocks && storefront.layout_blocks.length > 0) {
                setBlocks(storefront.layout_blocks);
            }

            // Fetch listings
            const { data: prods } = await supabase
                .from("listings")
                .select("*")
                .eq("store_id", merchant.id)
                .eq("is_active", true);

            setProducts(prods || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((p) => p.product.id === product.id);
            if (existing) {
                return prev.map((p) =>
                    p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((p) => p.product.id !== productId));
    };

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const proceedToCheckout = () => {
        localStorage.setItem(`cart_${domain}`, JSON.stringify(cart));
        setIsCartOpen(false);
        window.location.href = `/store/${domain}/checkout`;
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-gray-500">{t("storefront.not_found")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Render blocks from JSONB */}
            <BlockRenderer
                blocks={blocks}
                storeId={store.id}
                storeName={store.business_name}
            />

            {/* Cart Button */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed top-4 right-4 z-50 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg"
            >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                )}
            </button>

            {/* Cart Modal */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("storefront.cart.title")}</DialogTitle>
                    </DialogHeader>
                    {cart.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">{t("storefront.cart.empty")}</p>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                        {item.product.images?.[0] && (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.product.price?.toLocaleString()} XOF × {item.quantity}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-red-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <div className="border-t pt-4">
                                <div className="flex justify-between font-bold">
                                    <span>{t("common.total")}</span>
                                    <span>{totalAmount.toLocaleString()} XOF</span>
                                </div>
                            </div>
                            <Button onClick={proceedToCheckout} className="w-full">
                                {t("storefront.cart.checkout")}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
