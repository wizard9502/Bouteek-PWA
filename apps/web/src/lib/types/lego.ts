export type BrickType = 'hero' | 'grid' | 'video' | 'text' | 'trust' | 'identity';

export interface LegoBrick {
    id: string;
    type: BrickType;
    order: number;
    settings: Record<string, any>;
}

export interface StoreLayoutConfig {
    bricks: LegoBrick[];
    globalSettings?: {
        primaryColor?: string;
        fontFamily?: string;
        navLinks?: { label: string; url: string }[];
    };
}

// Default States for Bricks
export const DEFAULT_HERO_SETTINGS = {
    headline: "Welcome to our Store",
    subheadline: "Discover our premium collection",
    mediaUrl: "https://placehold.co/1200x600",
    mediaType: "image", // or 'video'
    ctaText: "Shop Now",
    ctaLink: "/products"
};

export const DEFAULT_GRID_SETTINGS = {
    title: "Featured Products",
    collectionId: "all", // or specific ID
    layout: "grid", // grid | carousel
    limit: 8
};

export const DEFAULT_VIDEO_SETTINGS = {
    videoUrl: "",
    autoplay: true,
    loop: true,
    muted: true
};
