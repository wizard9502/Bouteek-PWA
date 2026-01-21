// Block Registry - Maps block types to metadata and default settings

import { BlockMeta, BlockType, Block } from "./types";

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
    announcement_bar: {
        type: "announcement_bar",
        name: "Announcement Bar",
        description: "A thin strip at the top for promotions",
        icon: "Megaphone",
        category: "identity",
    },
    hero: {
        type: "hero",
        name: "Hero Section",
        description: "Full-width hero with image, headline, and CTA",
        icon: "Image",
        category: "hero",
    },
    video_loop: {
        type: "video_loop",
        name: "Video Loop",
        description: "Auto-playing video background section",
        icon: "Play",
        category: "hero",
    },
    multi_column_features: {
        type: "multi_column_features",
        name: "Feature Columns",
        description: "3-4 columns with icons and text",
        icon: "Columns3",
        category: "hero",
    },
    featured_grid: {
        type: "featured_grid",
        name: "Featured Products",
        description: "Grid of handpicked products",
        icon: "Grid3X3",
        category: "listings",
    },
    category_slider: {
        type: "category_slider",
        name: "Category Slider",
        description: "Horizontal row of category cards",
        icon: "LayoutList",
        category: "listings",
    },
    testimonial_slider: {
        type: "testimonial_slider",
        name: "Testimonials",
        description: "Customer reviews carousel",
        icon: "MessageSquareQuote",
        category: "trust",
    },
    gallery: {
        type: "gallery",
        name: "Gallery",
        description: "Instagram-style image grid",
        icon: "GalleryHorizontal",
        category: "trust",
    },
    contact_block: {
        type: "contact_block",
        name: "Contact Block",
        description: "WhatsApp and contact buttons",
        icon: "Phone",
        category: "conversion",
    },
    footer: {
        type: "footer",
        name: "Footer",
        description: "Site footer with social links",
        icon: "PanelBottom",
        category: "conversion",
    },
};

export const BLOCK_CATEGORIES = [
    { id: "identity", name: "Identity", description: "Header & Branding" },
    { id: "hero", name: "Hero & Visuals", description: "High-impact sections" },
    { id: "listings", name: "Listings", description: "Products & Categories" },
    { id: "trust", name: "Trust", description: "Social proof & reviews" },
    { id: "conversion", name: "Conversion", description: "Contact & Footer" },
];
