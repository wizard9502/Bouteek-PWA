"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Listing {
    id: string;
    store_id: string;
    module_type: string;
    title: string;
    base_price: number;
    is_active: boolean;
    metadata: Record<string, any>;
}

interface RealtimeUpdate {
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    listing: Listing;
    timestamp: Date;
}

interface UseRealtimeInventoryOptions {
    storeId?: string;
    onUpdate?: (update: RealtimeUpdate) => void;
    enabled?: boolean;
}

export function useRealtimeInventory(options: UseRealtimeInventoryOptions = {}) {
    const { storeId, onUpdate, enabled = true } = options;

    const [listings, setListings] = useState<Listing[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch initial listings
    const fetchListings = useCallback(async () => {
        if (!storeId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('store_id', storeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!enabled || !storeId) return;

        fetchListings();

        const channel: RealtimeChannel = supabase
            .channel(`listings_${storeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'listings',
                    filter: `store_id=eq.${storeId}`,
                },
                (payload) => {
                    const now = new Date();
                    setLastUpdate(now);

                    const eventType = payload.eventType.toUpperCase() as 'INSERT' | 'UPDATE' | 'DELETE';

                    if (eventType === 'INSERT') {
                        const newListing = payload.new as Listing;
                        setListings(prev => [newListing, ...prev]);
                        onUpdate?.({ type: 'INSERT', listing: newListing, timestamp: now });
                    } else if (eventType === 'UPDATE') {
                        const updatedListing = payload.new as Listing;
                        setListings(prev =>
                            prev.map(l => (l.id === updatedListing.id ? updatedListing : l))
                        );
                        onUpdate?.({ type: 'UPDATE', listing: updatedListing, timestamp: now });
                    } else if (eventType === 'DELETE') {
                        const deletedListing = payload.old as Listing;
                        setListings(prev => prev.filter(l => l.id !== deletedListing.id));
                        onUpdate?.({ type: 'DELETE', listing: deletedListing, timestamp: now });
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [storeId, enabled, fetchListings, onUpdate]);

    // Get stock level for a specific listing
    const getStockLevel = useCallback((listingId: string): number => {
        const listing = listings.find(l => l.id === listingId);
        if (!listing) return 0;

        // For sale items, get stock from metadata
        if (listing.module_type === 'sale') {
            const metadata = listing.metadata as { stock_level?: number; variants?: { stock: number }[] };
            if (metadata.variants && metadata.variants.length > 0) {
                return metadata.variants.reduce((total, v) => total + (v.stock || 0), 0);
            }
            return metadata.stock_level || 0;
        }

        // For rentals/services, just return a boolean indicator (1 = available, 0 = not)
        return listing.is_active ? 1 : 0;
    }, [listings]);

    // Check if a listing has low stock
    const hasLowStock = useCallback((listingId: string, threshold: number = 5): boolean => {
        const stock = getStockLevel(listingId);
        return stock > 0 && stock <= threshold;
    }, [getStockLevel]);

    // Get listings by module type
    const getByModuleType = useCallback((moduleType: 'sale' | 'rental' | 'service') => {
        return listings.filter(l => l.module_type === moduleType);
    }, [listings]);

    // Get active listings only
    const activeListings = listings.filter(l => l.is_active);

    // Get low stock items
    const lowStockListings = listings.filter(l =>
        l.module_type === 'sale' && hasLowStock(l.id)
    );

    // Refresh listings manually
    const refresh = useCallback(() => {
        fetchListings();
    }, [fetchListings]);

    return {
        // Data
        listings,
        activeListings,
        lowStockListings,

        // State
        isConnected,
        lastUpdate,
        loading,

        // Helpers
        getStockLevel,
        hasLowStock,
        getByModuleType,

        // Actions
        refresh,
    };
}
