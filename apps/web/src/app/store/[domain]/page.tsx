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

    const theme = store?.theme_settings || {};
    const {
        primaryColor = "#050505",
        accentColor = "#00FF41",
        fontFamily = "Inter",
        fontSize = "16px",
        heroImage,
        heroTitle,
        heroSubtitle,
        buttonText,
        logo,
        businessName,
        aboutTitle,
        aboutContent,
        aboutImage,
        footerTagline,
        footerAddress,
        footerEmail,
        footerPhone
    } = theme;


    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!store) return <div className="h-screen flex items-center justify-center">Store not found</div>;

    const socialLinks = store.social_links || {};

    return (
        <div className="min-h-screen bg-gray-50 pb-20" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-2">
                    {logo ? (
                        <img src={logo} alt={store.business_name} className="h-10 w-auto object-contain" />
                    ) : (
                        <h1 className="font-black text-2xl tracking-tighter" style={{ color: primaryColor }}>{businessName || store.business_name}</h1>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-6 text-sm font-medium opacity-70">
                        <a href="#" className="hover:text-primary transition-colors">Home</a>
                        <a href="#products" className="hover:text-primary transition-colors">Shop</a>
                        {aboutTitle && <a href="#about" className="hover:text-primary transition-colors">About</a>}
                    </nav>
                    <Button variant="outline" className="relative rounded-full w-10 h-10 p-0" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                                {cart.reduce((a, b) => a + b.quantity, 0)}
                            </span>
                        )}
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-black text-white">
                {heroImage ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <img src={heroImage} alt="Hero" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                        <div className="relative z-10 px-6 py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                                {heroTitle || store.business_name}
                            </h2>
                            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl leading-relaxed">
                                {heroSubtitle || "Welcome to our store"}
                            </p>
                            <Button
                                size="lg"
                                className="rounded-full px-8 py-6 text-lg font-bold transition-transform hover:scale-105"
                                style={{ backgroundColor: accentColor, color: '#000' }}
                            >
                                {buttonText || "Shop Now"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-16 text-center">
                        <p className="opacity-80 uppercase tracking-widest text-xs font-bold mb-4">Welcome to</p>
                        <h2 className="text-4xl font-black mb-6" style={{ color: accentColor }}>{store.business_name}</h2>
                        <p className="text-sm opacity-60">Verified Merchant</p>
                    </div>
                )}
            </div>

            {/* Products */}
            <div id="products" className="max-w-6xl mx-auto p-6 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-2xl md:text-3xl" style={{ color: primaryColor }}>Featured Collection</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                {product.images && product.images.length > 0 && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                )}
                                <div className="absolute bottom-3 right-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <Button
                                        size="icon"
                                        className="rounded-full shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                        onClick={() => addToCart(product)}
                                    >
                                        <Plus size={20} className="text-white" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <p className="text-sm font-medium opacity-60 mt-auto">{product.price?.toLocaleString()} XOF</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* About Us Section (Dynamic) */}
            {aboutTitle && (
                <section id="about" className="py-20 px-6 bg-gray-100/50 mt-10">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black" style={{ color: primaryColor }}>{aboutTitle}</h2>
                            <div className="w-20 h-1 bg-gray-200 mx-auto md:mx-0" style={{ backgroundColor: accentColor }} />
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{aboutContent}</p>
                        </div>
                        {aboutImage && (
                            <div className="flex-1 w-full max-w-md">
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 bg-white p-2">
                                    <img src={aboutImage} alt="About" className="w-full h-full object-cover rounded-2xl" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-black text-white pt-20 pb-10 px-6 mt-12">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2 space-y-6">
                        {logo ? (
                            <img src={logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                        ) : (
                            <div className="font-black text-3xl tracking-tighter">{businessName || store.business_name}</div>
                        )}
                        <p className="opacity-60 max-w-sm leading-relaxed">{footerTagline || "Your trusted online store for quality products."}</p>

                        {/* Social Links */}
                        <div className="flex gap-4 pt-2">
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {(footerEmail || footerPhone || footerAddress) && (
                        <div>
                            <h5 className="font-bold mb-6 text-lg">Contact</h5>
                            <div className="space-y-4 text-sm opacity-60">
                                {footerAddress && <p className="flex items-center gap-3">{footerAddress}</p>}
                                {footerEmail && <p className="flex items-center gap-3">{footerEmail}</p>}
                                {footerPhone && <p className="flex items-center gap-3">{footerPhone}</p>}
                            </div>
                        </div>
                    )}

                    <div>
                        <h5 className="font-bold mb-6 text-lg">Links</h5>
                        <div className="space-y-4 text-sm opacity-60 flex flex-col">
                            <a href="#" className="hover:text-white transition-colors">Shop All</a>
                            <a href="#about" className="hover:text-white transition-colors">About Us</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-xs opacity-40">
                    <p>© {new Date().getFullYear()} {businessName || store.business_name}. Powered by <span style={{ color: accentColor }}>Bouteek</span>.</p>
                </div>
            </footer>

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
