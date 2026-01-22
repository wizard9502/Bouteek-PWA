"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Listing {
    id: string;
    title: string;
    price: number;
    currency: string;
    media_urls: string[];
    primary_image_url?: string;
    module_type: 'sale' | 'rental' | 'service';
    status: string;
    metadata?: Record<string, any>;
}

interface FeaturedGridQuery {
    storeId?: string | number;
    moduleType?: 'sale' | 'rental' | 'service' | 'all';
    categoryId?: string;
    tagIds?: string[];
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    limit?: number;
    featured?: boolean;
}

interface UseFeaturedGridOptions {
    query: FeaturedGridQuery;
    revalidateOnFocus?: boolean;
}

/**
 * useFeaturedGrid - Dynamic listing queries for FeaturedGrid block
 * 
 * Fetches listings based on configurable filters for display in the store builder
 */
export function useFeaturedGrid(options: UseFeaturedGridOptions) {
    const { query, revalidateOnFocus = false } = options;

    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let queryBuilder = supabase
                .from('listings')
                .select('id, title, price, currency, media_urls, primary_image_url, module_type, status, metadata')
                .eq('status', 'published');

            // Filter by store
            if (query.storeId) {
                queryBuilder = queryBuilder.eq('store_id', query.storeId);
            }

            // Filter by module type
            if (query.moduleType && query.moduleType !== 'all') {
                queryBuilder = queryBuilder.eq('module_type', query.moduleType);
            }

            // Filter by category
            if (query.categoryId) {
                queryBuilder = queryBuilder.eq('category_id', query.categoryId);
            }

            // Filter by featured flag
            if (query.featured) {
                queryBuilder = queryBuilder.eq('metadata->featured', true);
            }

            // Apply sorting
            switch (query.sortBy) {
                case 'newest':
                    queryBuilder = queryBuilder.order('created_at', { ascending: false });
                    break;
                case 'price_asc':
                    queryBuilder = queryBuilder.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    queryBuilder = queryBuilder.order('price', { ascending: false });
                    break;
                case 'popular':
                    queryBuilder = queryBuilder.order('view_count', { ascending: false });
                    break;
                default:
                    queryBuilder = queryBuilder.order('created_at', { ascending: false });
            }

            // Apply limit
            if (query.limit) {
                queryBuilder = queryBuilder.limit(query.limit);
            }

            const { data, error: fetchError } = await queryBuilder;

            if (fetchError) {
                throw fetchError;
            }

            setListings(data || []);
        } catch (err) {
            console.error('Error fetching featured listings:', err);
            setError('Failed to load listings');
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    // Initial fetch
    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // Revalidate on focus
    useEffect(() => {
        if (!revalidateOnFocus) return;

        const handleFocus = () => fetchListings();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [revalidateOnFocus, fetchListings]);

    // Get image URL (primary or first)
    const getImageUrl = useCallback((listing: Listing) => {
        return listing.primary_image_url || listing.media_urls?.[0] || '/placeholder.svg';
    }, []);

    // Format price
    const formatPrice = useCallback((listing: Listing) => {
        return new Intl.NumberFormat('fr-SN', {
            style: 'currency',
            currency: listing.currency || 'XOF',
            minimumFractionDigits: 0,
        }).format(listing.price);
    }, []);

    return {
        listings,
        isLoading,
        error,
        refetch: fetchListings,
        getImageUrl,
        formatPrice,
    };
}

export default useFeaturedGrid;
