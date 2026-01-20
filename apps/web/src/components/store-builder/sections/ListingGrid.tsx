"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag, Calendar, Clock, Package } from 'lucide-react';

interface ListingGridConfig {
    module: 'sale' | 'rental' | 'service';
    columns: number;
    limit: number;
    showPrices: boolean;
    showAddToCart: boolean;
    category: string | null;
    title: string;
}

// Mock data for preview (in production, this would come from Supabase)
const MOCK_LISTINGS = {
    sale: [
        { id: '1', title: 'Premium Sneakers', price: 45000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
        { id: '2', title: 'Designer Bag', price: 85000, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400' },
        { id: '3', title: 'Sunglasses', price: 25000, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
        { id: '4', title: 'Watch Classic', price: 150000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    ],
    rental: [
        { id: '1', title: 'Mercedes S-Class', price: 150000, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400', period: '/day' },
        { id: '2', title: 'BMW X5', price: 120000, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400', period: '/day' },
        { id: '3', title: 'Luxury Villa', price: 500000, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', period: '/week' },
        { id: '4', title: 'Camera Kit', price: 50000, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', period: '/day' },
    ],
    service: [
        { id: '1', title: 'Spa Massage', price: 35000, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', duration: '60 min' },
        { id: '2', title: 'Hair Styling', price: 25000, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', duration: '45 min' },
        { id: '3', title: 'Consultation', price: 50000, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400', duration: '30 min' },
        { id: '4', title: 'Makeup Session', price: 40000, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', duration: '90 min' },
    ],
};

/**
 * ListingGrid - Display products, rentals, or services
 */
export function ListingGrid({ config, moduleType, isEditing }: BaseSectionProps) {
    const gridConfig = config as ListingGridConfig;
    const module = gridConfig.module || moduleType;
    const listings = MOCK_LISTINGS[module].slice(0, gridConfig.limit || 4);

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
                <div className={cn('grid gap-6', gridCols[gridConfig.columns as keyof typeof gridCols] || 'grid-cols-2')}>
                    {listings.map((listing: any) => (
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
                    ))}
                </div>
            </div>
        </section>
    );
}

// Register component
registerComponent('listing_grid', ListingGrid);

export default ListingGrid;
