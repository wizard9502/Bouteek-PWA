import { z } from 'zod';

// Base section schema
const baseSectionSchema = z.object({
    id: z.string(),
    type: z.string(),
    visible: z.boolean().optional().default(true),
    hideOnMobile: z.boolean().optional().default(false),
});

// Hero section config
export const heroConfigSchema = z.object({
    title: z.string().default('Welcome'),
    subtitle: z.string().optional().default(''),
    buttonText: z.string().optional().default('Shop Now'),
    buttonLink: z.string().optional().default('/products'),
    backgroundType: z.enum(['image', 'video', 'color']).default('image'),
    backgroundValue: z.string().default(''),
    overlay: z.boolean().default(true),
    overlayOpacity: z.number().min(0).max(1).default(0.3),
});

// Listing grid config
export const listingGridConfigSchema = z.object({
    module: z.enum(['sale', 'rental', 'service']).default('sale'),
    columns: z.number().min(1).max(6).default(2),
    limit: z.number().min(1).max(50).default(8),
    showPrices: z.boolean().default(true),
    showAddToCart: z.boolean().default(true),
    category: z.string().nullable().optional(),
    title: z.string().optional().default('Featured'),
});

// Video section config
export const videoConfigSchema = z.object({
    videoUrl: z.string().url().or(z.literal('')).default(''),
    autoplay: z.boolean().default(false),
    muted: z.boolean().default(true),
    loop: z.boolean().default(true),
    title: z.string().optional().default(''),
    description: z.string().optional().default(''),
});

// Testimonials config
export const testimonialsConfigSchema = z.object({
    title: z.string().default('What Our Customers Say'),
    items: z.array(z.object({
        author: z.string(),
        text: z.string(),
        rating: z.number().min(1).max(5).default(5),
        avatar: z.string().optional(),
    })).default([]),
});

// Booking widget config
export const bookingWidgetConfigSchema = z.object({
    mode: z.enum(['rental', 'service']).default('rental'),
    showTimeSlots: z.boolean().default(true),
    minDuration: z.number().min(1).default(1),
    maxDuration: z.number().max(365).default(30),
    title: z.string().optional().default('Book Now'),
});

// CTA banner config
export const ctaBannerConfigSchema = z.object({
    title: z.string().default('Ready to get started?'),
    subtitle: z.string().optional().default(''),
    buttonText: z.string().default('Get Started'),
    buttonLink: z.string().default('/signup'),
    backgroundColor: z.string().default('#000000'),
    textColor: z.string().default('#ffffff'),
});

// Text block config
export const textBlockConfigSchema = z.object({
    title: z.string().optional().default(''),
    content: z.string().default(''),
    alignment: z.enum(['left', 'center', 'right']).default('left'),
});

// Features config
export const featuresConfigSchema = z.object({
    title: z.string().default('Why Choose Us'),
    items: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
    })).default([]),
});

// Gallery config
export const galleryConfigSchema = z.object({
    images: z.array(z.string()).default([]),
    columns: z.number().min(2).max(6).default(3),
    aspectRatio: z.enum(['square', 'portrait', 'landscape']).default('square'),
    title: z.string().optional(),
});

// Contact config
export const contactConfigSchema = z.object({
    title: z.string().default('Get in Touch'),
    email: z.string().email().or(z.literal('')).default(''),
    phone: z.string().default(''),
    address: z.string().default(''),
    showForm: z.boolean().default(true),
});

// FAQ config
export const faqConfigSchema = z.object({
    title: z.string().default('Frequently Asked Questions'),
    items: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })).default([]),
});

// Map section types to their config schemas
export const sectionConfigSchemas: Record<string, z.ZodSchema> = {
    hero: heroConfigSchema,
    listing_grid: listingGridConfigSchema,
    video: videoConfigSchema,
    testimonials: testimonialsConfigSchema,
    booking_widget: bookingWidgetConfigSchema,
    cta_banner: ctaBannerConfigSchema,
    text_block: textBlockConfigSchema,
    features: featuresConfigSchema,
    gallery: galleryConfigSchema,
    contact: contactConfigSchema,
    faq: faqConfigSchema,
};

// Full section schema with config
export const sectionSchema = baseSectionSchema.extend({
    config: z.record(z.any()),
});

// Full layout schema
export const layoutSchema = z.object({
    sections: z.array(sectionSchema),
});

// Social links schema
export const socialLinksSchema = z.object({
    instagram: z.string().url().or(z.literal('')).default(''),
    snapchat: z.string().url().or(z.literal('')).default(''),
    tiktok: z.string().url().or(z.literal('')).default(''),
});

// Theme settings schema
export const themeSettingsSchema = z.object({
    primaryColor: z.string().default('#000000'),
    secondaryColor: z.string().default('#ffffff'),
    accentColor: z.string().default('#00FF41'),
    fontFamily: z.string().default('Inter'),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('lg'),
});

// Full storefront config
export const storefrontConfigSchema = z.object({
    layout: layoutSchema,
    theme: themeSettingsSchema,
    socialLinks: socialLinksSchema,
});

// Validation helpers
export function validateSectionConfig(type: string, config: unknown) {
    const schema = sectionConfigSchemas[type];
    if (!schema) return { success: false, error: 'Unknown section type' };
    return schema.safeParse(config);
}

export function validateLayout(layout: unknown) {
    return layoutSchema.safeParse(layout);
}

export type LayoutSchema = z.infer<typeof layoutSchema>;
export type SectionSchema = z.infer<typeof sectionSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
