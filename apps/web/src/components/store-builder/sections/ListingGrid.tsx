"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag, Calendar, Clock, Package } from 'lucide-react';

interface Listing {
    id: string;
    title: string;
    price: number;
    image: string;
    period?: string;
    duration?: string;
    metadata?: any;
}

interface ListingGridConfig {
    module: 'sale' | 'rental' | 'service';
    columns: number;
    limit: number;
    showPrices: boolean;
    showAddToCart: boolean;
    category: string | null;
    title: string;
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

/**
 * ListingGrid - Display products, rentals, or services
 */
export function ListingGrid({ config, moduleType, isEditing }: BaseSectionProps) {
    const params = useParams();
    const domain = params?.domain as string;

    const gridConfig = config as ListingGridConfig;
    const module = gridConfig.module || moduleType;

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(!isEditing);

    useEffect(() => {
        if (!isEditing && domain) {
            fetchRealListings();
        } else {
            // In editor or if no domain, potentially show limited real data or keep placeholders
            // For now, let's fetch real data even in editor if we can identify the store
            fetchRealListings();
        }
    }, [domain, module, gridConfig.limit]);

    const fetchRealListings = async () => {
        try {
            setLoading(true);

            // 1. Get Store ID from domain
            const { data: merchant } = await supabase
                .from('merchants')
                .select('id')
                .eq('slug', domain)
                .single();

            if (!merchant) return;

            // 2. Fetch Listings
            let query = supabase
                .from('listings')
                .select('*')
                .eq('store_id', merchant.id)
                .eq('module_type', module)
                .eq('is_active', true);

            if (gridConfig.category) {
                query = query.eq('category', gridConfig.category);
            }

            const { data } = await query
                .order('created_at', { ascending: false })
                .limit(gridConfig.limit || 4);

            if (data) {
                setListings(data.map(l => ({
                    id: l.id,
                    title: l.title,
                    price: l.price,
                    image: l.images?.[0] || 'https://via.placeholder.com/400',
                    period: l.metadata?.rental_period,
                    duration: l.metadata?.service_duration,
                    metadata: l.metadata
                })));
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
        5: 'grid-cols-2 md:grid-cols-5',
        6: 'grid-cols-2 md:grid-cols-6',
    };

    const getActionButton = (listing: any) => {
        switch (module) {
            case 'rental':
                return (
                    <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-bold">
                        <Calendar className="mr-1" size={14} />
                        Book Now
                    </Button>
                );
            case 'service':
                return (
                    <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-bold">
                        <Clock className="mr-1" size={14} />
                        Schedule
                    </Button>
                );
            default:
                return (
                    <Button size="sm" className="w-full rounded-xl text-xs font-bold bg-black text-white hover:bg-black/80">
                        <ShoppingBag className="mr-1" size={14} />
                        Add to Cart
                    </Button>
                );
        }
    };

    return (
        <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Section Title */}
                {gridConfig.title && (
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black">{gridConfig.title}</h2>
                        <button className="text-sm font-bold underline">View All</button>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-square bg-muted rounded-2xl" />
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cn('grid gap-6', gridCols[gridConfig.columns as keyof typeof gridCols] || 'grid-cols-2')}>
                        {listings.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-muted-foreground font-medium">
                                No items found in this category.
                            </div>
                        ) : (
                            listings.map((listing: Listing) => (
                                <div key={listing.id} className="group cursor-pointer">
                                    {/* Image */}
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
                                        <img
                                            src={listing.image}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-bouteek-green transition-colors">
                                            {listing.title}
                                        </h3>

                                        {gridConfig.showPrices && (
                                            <p className="text-lg font-black">
                                                {listing.price.toLocaleString()} <span className="text-xs text-muted-foreground">XOF{listing.period || ''}</span>
                                            </p>
                                        )}

                                        {/* Module-specific extra info */}
                                        {module === 'service' && listing.duration && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock size={12} /> {listing.duration}
                                            </p>
                                        )}

                                        {gridConfig.showAddToCart && getActionButton(listing)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

// Register component
registerComponent('listing_grid', ListingGrid);

export default ListingGrid;
