"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingCart, Instagram, Star, MapPin, Phone, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/contexts/TranslationContext";

interface Listing {
    id: string;
    title: string;
    price: number;
    currency: string;
    image_urls: string[];
    module: string;
    is_active: boolean;
}

interface Storefront {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    banner_url?: string;
    theme?: {
        primary_color?: string;
        accent_color?: string;
        font_family?: string;
    };
    social_links?: {
        instagram?: string;
        snapchat?: string;
        tiktok?: string;
    };
    payment_methods?: {
        orange_money?: { phone: string; enabled: boolean };
        wave?: { phone: string; enabled: boolean };
    };
    merchant_id: number;
    merchants?: {
        businessName?: string;
        phone?: string;
        location?: string;
    };
}

interface Props {
    storefront: Storefront;
}

export default function StorefrontView({ storefront }: Props) {
    const { t, language, setLanguage } = useTranslation();
    const [listings, setListings] = useState<Listing[]>([]);
    const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const primaryColor = storefront.theme?.primary_color || "#000000";
    const accentColor = storefront.theme?.accent_color || "#00FF41";

    useEffect(() => {
        loadListings();
    }, [storefront.merchant_id]);

    const loadListings = async () => {
        try {
            const { data } = await supabase
                .from("listings")
                .select("*")
                .eq("store_id", storefront.merchant_id)
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            setListings(data || []);
        } catch (error) {
            console.error("Error loading listings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("fr-SN", {
            style: "currency",
            currency: currency || "XOF",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Banner */}
            <div
                className="relative h-48 md:h-64 bg-gradient-to-br from-gray-900 to-gray-700"
                style={storefront.banner_url ? {
                    backgroundImage: `url(${storefront.banner_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                } : {
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`
                }}
            >
                <div className="absolute inset-0 bg-black/40" />

                {/* Store Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        {storefront.logo_url ? (
                            <img
                                src={storefront.logo_url}
                                alt={storefront.name}
                                className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg object-cover"
                            />
                        ) : (
                            <div
                                className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center text-2xl font-black"
                                style={{ backgroundColor: accentColor }}
                            >
                                {storefront.name?.charAt(0) || "B"}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-black">{storefront.name}</h1>
                            {storefront.description && (
                                <p className="text-sm opacity-90">{storefront.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Meta */}
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-600">
                    {storefront.merchants?.location && (
                        <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {storefront.merchants.location}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {language === 'wo' ? "Ubbi na" : language === 'fr' ? "Ouvert" : "Open Now"}
                    </span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                    {storefront.social_links?.instagram && (
                        <a
                            href={`https://instagram.com/${storefront.social_links.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-pink-500 transition-colors"
                        >
                            <Instagram size={18} />
                        </a>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="p-4">
                <h2 className="text-lg font-bold mb-4">
                    {t("storefront.success.items")} ({listings.length})
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <ShoppingCart className="mx-auto mb-2 opacity-30" size={48} />
                        <p>{t("common.empty_inventory")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {listings.map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={`item-${item.id}`}
                                onClick={() => setSelectedItem(item)}
                                className="bg-white rounded-xl overflow-hidden border shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className="aspect-square bg-gray-100">
                                    {item.image_urls?.[0] ? (
                                        <img
                                            src={item.image_urls[0]}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingCart size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                    <p
                                        className="font-black text-sm"
                                        style={{ color: accentColor }}
                                    >
                                        {formatPrice(item.price, item.currency)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        >
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100">
                                {selectedItem.image_urls?.[0] ? (
                                    <img
                                        src={selectedItem.image_urls[0]}
                                        alt={selectedItem.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingCart size={64} />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h2 className="text-xl font-black">{selectedItem.title}</h2>
                                    <p
                                        className="text-2xl font-black"
                                        style={{ color: accentColor }}
                                    >
                                        {formatPrice(selectedItem.price, selectedItem.currency)}
                                    </p>
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-3 pt-4 border-t">
                                    <p className="text-sm font-semibold text-gray-600">{t("storefront.checkout.payment")}</p>

                                    {storefront.payment_methods?.orange_money?.enabled && (
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                            <div className="w-10 h-10 rounded-lg bg-[#ff7900] flex items-center justify-center">
                                                <Phone className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Orange Money</p>
                                                <p className="text-xs text-gray-600 font-mono">
                                                    {storefront.payment_methods.orange_money.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {storefront.payment_methods?.wave?.enabled && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="w-10 h-10 rounded-lg bg-[#1da1f2] flex items-center justify-center">
                                                <Phone className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Wave</p>
                                                <p className="text-xs text-gray-600 font-mono">
                                                    {storefront.payment_methods.wave.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <Link
                                        href={`/checkout/${selectedItem.id}?store=${storefront.slug}`}
                                        className="block w-full py-4 rounded-xl text-center font-black text-white"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {t("storefront.checkout.checkout")}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="py-8 px-4 text-center text-sm text-gray-400 border-t mt-8">
                <p>
                    {t("storefront.success.powered_by")}{" "}
                    <a
                        href="https://bouteek.shop"
                        className="text-gray-600 hover:text-black transition-colors"
                    >
                        Bouteek
                    </a>
                </p>
            </div>

            {/* Language Toggle for Customers */}
            <div className="fixed bottom-6 right-6 z-[60]">
                <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-full border shadow-2xl scale-90 md:scale-100">
                    <button
                        onClick={() => setLanguage("fr")}
                        className={cn("px-3 py-1.5 rounded-full text-[10px] font-black transition-all", language === "fr" ? "bg-black text-white" : "text-gray-400")}
                    >
                        FR
                    </button>
                    <button
                        onClick={() => setLanguage("en")}
                        className={cn("px-3 py-1.5 rounded-full text-[10px] font-black transition-all", language === "en" ? "bg-black text-white" : "text-gray-400")}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage("wo")}
                        className={cn("px-3 py-1.5 rounded-full text-[10px] font-black transition-all", language === "wo" ? "bg-black text-white" : "text-gray-400")}
                    >
                        WO
                    </button>
                </div>
            </div>
        </div>
    );
}
