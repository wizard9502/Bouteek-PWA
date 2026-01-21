// Default Block Configurations

import { Block, BlockType } from "./types";

function generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createBlock(type: BlockType): Block {
    const id = generateId();

    switch (type) {
        case "announcement_bar":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    text: "🔥 Free shipping on orders over 25,000 XOF!",
                    bgColor: "#000000",
                    textColor: "#ffffff",
                    link: "",
                },
            };

        case "hero":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920",
                    headline: "New Collection",
                    subtitle: "Discover our latest arrivals",
                    buttonText: "Shop Now",
                    buttonLink: "#products",
                    overlayOpacity: 0.4,
                },
            };

        case "video_loop":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    videoUrl: "",
                    autoplay: true,
                    muted: true,
                    posterImage: "",
                },
            };

        case "multi_column_features":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    columns: [
                        { icon: "Truck", title: "Fast Delivery", description: "2-3 business days" },
                        { icon: "Shield", title: "Secure Payment", description: "100% protected" },
                        { icon: "RotateCcw", title: "Easy Returns", description: "30-day policy" },
                    ],
                },
            };

        case "featured_grid":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    title: "Featured Products",
                    productIds: [],
                    columns: 4,
                    showPrice: true,
                },
            };

        case "category_slider":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    title: "Shop by Category",
                    categories: [],
                },
            };

        case "testimonial_slider":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    title: "What Our Customers Say",
                    testimonials: [
                        {
                            name: "Aissatou D.",
                            text: "Amazing quality and fast delivery. Will definitely order again!",
                            rating: 5,
                        },
                    ],
                },
            };

        case "gallery":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    title: "Gallery",
                    images: [],
                    columns: 3,
                },
            };

        case "contact_block":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    whatsapp: "",
                    phone: "",
                    email: "",
                    showFloatingButton: true,
                },
            };

        case "footer":
            return {
                id,
                type,
                enabled: true,
                settings: {
                    tagline: "Your trusted online store",
                    socialLinks: {},
                    address: "Dakar, Senegal",
                    copyrightText: "© 2025 All rights reserved",
                },
            };

        default:
            throw new Error(`Unknown block type: ${type}`);
    }
}

// Default starter layout for new stores
export const DEFAULT_LAYOUT: Block[] = [
    createBlock("announcement_bar"),
    createBlock("hero"),
    createBlock("multi_column_features"),
    createBlock("featured_grid"),
    createBlock("testimonial_slider"),
    createBlock("contact_block"),
    createBlock("footer"),
];
