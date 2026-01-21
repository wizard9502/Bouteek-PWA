"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface StorefrontData {
    id: string;
    slug: string;
    name: string;
    description?: string;
    live_layout: {
        sections: any[];
        theme_settings: any;
        published_at: string;
    } | null;
    is_published: boolean;
    merchant: {
        id: string;
        business_name: string;
        is_verified: boolean;
        contact_phone?: string;
        whatsapp?: string;
    };
    listings: any[];
    payment_methods: any[];
}

export function useStorefrontData(domain: string) {
    const [data, setData] = useState<StorefrontData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStorefrontData();
    }, [domain]);

    const fetchStorefrontData = async () => {
        try {
            setLoading(true);
            setError(null);

            const identifier = decodeURIComponent(domain);

            // First try to find merchant by slug
            let { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .select(`
                    id, 
                    business_name, 
                    slug, 
                    is_verified, 
                    contact_phone, 
                    whatsapp,
                    storefronts (
                        id,
                        slug,
                        name,
                        description,
                        live_layout,
                        is_published,
                        theme_settings
                    )
                `)
                .eq('slug', identifier)
                .single();

            // If not found by slug, try custom domain
            if (!merchant) {
                const { data: customDomain } = await supabase
                    .from('custom_domains')
                    .select('store_id')
                    .eq('domain', identifier)
                    .eq('verified', true)
                    .single();

                if (customDomain) {
                    const { data: merchantByDomain } = await supabase
                        .from('merchants')
                        .select(`
                            id, 
                            business_name, 
                            slug, 
                            is_verified, 
                            contact_phone, 
                            whatsapp,
                            storefronts (
                                id,
                                slug,
                                name,
                                description,
                                live_layout,
                                is_published,
                                theme_settings
                            )
                        `)
                        .eq('id', customDomain.store_id)
                        .single();

                    merchant = merchantByDomain;
                }
            }

            if (!merchant) {
                setError('Store not found');
                setLoading(false);
                return;
            }

            const storefront = merchant.storefronts?.[0];

            if (!storefront || !storefront.is_published) {
                setError('Store is not published');
                setLoading(false);
                return;
            }

            // Fetch active listings
            const { data: listings } = await supabase
                .from('listings')
                .select('*')
                .eq('store_id', merchant.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            // Fetch payment methods
            const { data: paymentMethods } = await supabase
                .from('storefront_payment_methods')
                .select('*')
                .eq('storefront_id', storefront.id)
                .eq('is_active', true);

            setData({
                id: storefront.id,
                slug: storefront.slug,
                name: storefront.name || merchant.business_name,
                description: storefront.description,
                live_layout: storefront.live_layout,
                is_published: storefront.is_published,
                merchant: {
                    id: merchant.id,
                    business_name: merchant.business_name,
                    is_verified: merchant.is_verified,
                    contact_phone: merchant.contact_phone,
                    whatsapp: merchant.whatsapp,
                },
                listings: listings || [],
                payment_methods: paymentMethods || [],
            });

        } catch (err: any) {
            console.error('Storefront fetch error:', err);
            setError(err.message || 'Failed to load storefront');
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch: fetchStorefrontData };
}
