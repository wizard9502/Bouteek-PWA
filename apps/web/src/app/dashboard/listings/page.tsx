"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Plus,
    Filter,
    Search,
    MoreVertical,
    ShoppingBag,
    Key,
    Sparkles,
    Eye,
    Edit3,
    Trash2,
    Copy,
    Power,
    Loader2,
    PackageX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory";
import { ModuleType } from "@/lib/listing-schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Listing {
    id: string;
    store_id: string;
    module_type: ModuleType;
    title: string;
    description: string;
    base_price: number;
    media_urls: string[];
    is_active: boolean;
    is_featured: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

const MODULE_CONFIG = {
    sale: { icon: ShoppingBag, color: "#00FF41", label: "Sale" },
    rental: { icon: Key, color: "#6366F1", label: "Rental" },
    service: { icon: Sparkles, color: "#EC4899", label: "Service" },
};

export default function ListingsPage() {
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<ModuleType | "all">("all");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize merchant
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (merchant) {
                setMerchantId(merchant.id);
            }
        };
        init();
    }, []);

    // Use realtime inventory hook
    const {
        listings: realtimeListings,
        isConnected,
        loading: realtimeLoading,
        getStockLevel,
        hasLowStock
    } = useRealtimeInventory({
        storeId: merchantId || undefined,
        enabled: !!merchantId,
    });

    // Update listings from realtime
    useEffect(() => {
        if (realtimeListings.length > 0) {
            setListings(realtimeListings as Listing[]);
            setLoading(false);
        } else if (!realtimeLoading && merchantId) {
            setLoading(false);
        }
    }, [realtimeListings, realtimeLoading, merchantId]);

    // Filter listings
    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || listing.module_type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Toggle active status
    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('listings')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success(currentStatus ? 'Listing deactivated' : 'Listing activated');
        }
    };

    // Duplicate listing
    const duplicateListing = async (listing: Listing) => {
        const { id, created_at, ...rest } = listing;
        const { error } = await supabase
            .from('listings')
            .insert({ ...rest, title: `${listing.title} (Copy)` });

        if (error) {
            toast.error('Failed to duplicate');
        } else {
            toast.success('Listing duplicated!');
        }
    };

    // Delete listing
    const deleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete');
        } else {
            toast.success('Listing deleted');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black">Listings</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your products, rentals, and services
                        {isConnected && (
                            <span className="ml-2 inline-flex items-center gap-1 text-bouteek-green">
                                <span className="w-2 h-2 rounded-full bg-bouteek-green animate-pulse" />
                                Live
                            </span>
                        )}
                    </p>
                </div>

                <Link href="/dashboard/listings/new">
                    <Button className="rounded-xl h-12 px-6 bg-bouteek-green text-black font-black">
                        <Plus size={18} className="mr-2" />
                        New Listing
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Module Filter Tabs */}
                <div className="flex rounded-2xl bg-muted/30 p-1">
                    <button
                        onClick={() => setActiveFilter("all")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            activeFilter === "all"
                                ? "bg-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All
                    </button>
                    {(["sale", "rental", "service"] as ModuleType[]).map((type) => {
                        const config = MODULE_CONFIG[type];
                        const Icon = config.icon;
                        return (
                            <button
                                key={type}
                                onClick={() => setActiveFilter(type)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                    activeFilter === type
                                        ? "bg-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon size={14} style={{ color: config.color }} />
                                {config.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="pl-11 h-12 rounded-xl"
                    />
                </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-bouteek-green" />
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <PackageX size={64} className="text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Create your first listing to start selling
                    </p>
                    <Link href="/dashboard/listings/new">
                        <Button className="rounded-xl bg-bouteek-green text-black font-bold">
                            <Plus size={16} className="mr-2" />
                            Create Listing
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredListings.map((listing, index) => {
                            const config = MODULE_CONFIG[listing.module_type];
                            const Icon = config.icon;
                            const stockLevel = getStockLevel(listing.id);
                            const isLowStock = hasLowStock(listing.id);

                            return (
                                <motion.div
                                    key={listing.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "rounded-3xl border overflow-hidden bg-card transition-all hover:shadow-lg",
                                        !listing.is_active && "opacity-60"
                                    )}
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] bg-muted relative">
                                        {listing.media_urls?.[0] ? (
                                            <img
                                                src={listing.media_urls[0]}
                                                alt={listing.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Icon size={48} className="text-muted-foreground" />
                                            </div>
                                        )}

                                        {/* Status badges */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span
                                                className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white"
                                                style={{ backgroundColor: config.color }}
                                            >
                                                {config.label}
                                            </span>
                                            {listing.is_featured && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-black">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>

                                        {/* Inactive overlay */}
                                        {!listing.is_active && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-black rounded-full text-white text-xs font-bold">
                                                    Inactive
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions menu */}
                                        <div className="absolute top-3 right-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/listings/${listing.id}/edit`} className="flex items-center gap-2">
                                                            <Edit3 size={14} /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => duplicateListing(listing)}>
                                                        <Copy size={14} className="mr-2" /> Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleActive(listing.id, listing.is_active)}>
                                                        <Power size={14} className="mr-2" />
                                                        {listing.is_active ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteListing(listing.id)}
                                                        className="text-red-500 focus:text-red-500"
                                                    >
                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>

                                        {listing.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {listing.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xl font-black" style={{ color: config.color }}>
                                                {listing.base_price.toLocaleString()} XOF
                                            </span>

                                            {listing.module_type === 'sale' && (
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded-full",
                                                    isLowStock
                                                        ? "bg-red-500/10 text-red-500"
                                                        : "bg-muted"
                                                )}>
                                                    Stock: {stockLevel}
                                                </span>
                                            )}

                                            {listing.module_type === 'service' && (
                                                <span className="text-xs text-muted-foreground">
                                                    {listing.metadata.duration_minutes} min
                                                </span>
                                            )}

                                            {listing.module_type === 'rental' && (
                                                <span className="text-xs text-muted-foreground">
                                                    /{listing.metadata.rental_unit}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
