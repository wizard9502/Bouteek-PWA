"use client";

import { FeaturedGridSettings } from "@/lib/blocks/types";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
    settings: FeaturedGridSettings;
    storeId?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
}

export function FeaturedGrid({ settings, storeId }: Props) {
    const { title, productIds, columns, showPrice } = settings;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!storeId) {
                setLoading(false);
                return;
            }

            try {
                let query = supabase
                    .from("listings")
                    .select("id, name, price, images")
                    .eq("store_id", storeId)
                    .eq("is_active", true);

                // If specific products selected, filter by IDs
                if (productIds && productIds.length > 0) {
                    query = query.in("id", productIds);
                }

                const { data } = await query.limit(columns * 2);
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [storeId, productIds, columns]);

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4",
    };

    return (
        <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-black mb-8">{title}</h2>
                )}

                {loading ? (
                    <div className={`grid gap-6 ${gridCols[columns]}`}>
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No products to display</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${gridCols[columns]}`}>
                        {products.map((product) => (
                            <a
                                key={product.id}
                                href={`#product-${product.id}`}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                                <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                {showPrice && (
                                    <p className="text-sm text-gray-600">
                                        {product.price?.toLocaleString()} XOF
                                    </p>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
