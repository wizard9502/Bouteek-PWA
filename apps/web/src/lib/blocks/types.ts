// Block Type Definitions for Lego-Style Store Builder

export type BlockType =
    | "announcement_bar"
    | "hero"
    | "video_loop"
    | "multi_column_features"
    | "featured_grid"
    | "category_slider"
    | "testimonial_slider"
    | "gallery"
    | "contact_block"
    | "footer";

export interface Block {
    id: string;
    type: BlockType;
    enabled: boolean;
    settings: BlockSettings;
}

export type BlockSettings =
    | AnnouncementBarSettings
    | HeroSettings
    | VideoLoopSettings
    | MultiColumnFeaturesSettings
    | FeaturedGridSettings
    | CategorySliderSettings
    | TestimonialSliderSettings
    | GallerySettings
    | ContactBlockSettings
    | FooterSettings;

// Individual Block Settings

export interface AnnouncementBarSettings {
    text: string;
    bgColor: string;
    textColor: string;
    link?: string;
}

export interface HeroSettings {
    backgroundImage: string;
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    overlayOpacity: number;
}

export interface VideoLoopSettings {
    videoUrl: string;
    autoplay: boolean;
    muted: boolean;
    posterImage?: string;
}

export interface FeatureColumn {
    icon: string;
    title: string;
    description: string;
}

export interface MultiColumnFeaturesSettings {
    columns: FeatureColumn[];
}

export interface FeaturedGridSettings {
    title: string;
    productIds: string[];
    columns: 2 | 3 | 4;
    showPrice: boolean;
}

export interface CategoryItem {
    name: string;
    image: string;
    link: string;
}

export interface CategorySliderSettings {
    title: string;
    categories: CategoryItem[];
}

export interface Testimonial {
    name: string;
    text: string;
    rating: number;
    avatar?: string;
}

export interface TestimonialSliderSettings {
    title: string;
    testimonials: Testimonial[];
}

export interface GallerySettings {
    title: string;
    images: string[];
    columns: 2 | 3 | 4;
}

export interface ContactBlockSettings {
    whatsapp: string;
    phone: string;
    email: string;
    showFloatingButton: boolean;
}

export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
}

export interface FooterSettings {
    tagline: string;
    socialLinks: SocialLinks;
    address: string;
    copyrightText: string;
}

// Block Metadata for Editor
export interface BlockMeta {
    type: BlockType;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    category: "identity" | "hero" | "listings" | "trust" | "conversion";
}
