import { SectionConfig, ModuleType } from './component-registry';
import { ThemeSettings, SocialLinks } from './section-schemas';

export interface TemplatePreset {
    id: string;
    name: string;
    description: string;
    module: ModuleType;
    image: string;
    theme: ThemeSettings;
    layout: { sections: SectionConfig[] };
    socialLinks: SocialLinks;
}

/**
 * 6 Starter Templates as per specification
 */
export const TEMPLATE_PRESETS: TemplatePreset[] = [
    // 1. Minimalist (Sale/Fashion)
    {
        id: 'minimalist_fashion',
        name: 'Minimalist Fashion',
        description: 'Clean, high-res image focus for fashion and lifestyle brands',
        module: 'sale',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        theme: {
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            accentColor: '#000000',
            fontFamily: 'Inter',
            borderRadius: 'none',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'New Season',
                        subtitle: 'Effortless style for every occasion',
                        buttonText: 'Shop Collection',
                        buttonLink: '/products',
                        backgroundType: 'image',
                        backgroundValue: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920',
                        overlay: true,
                        overlayOpacity: 0.2,
                    },
                },
                {
                    id: 'products',
                    type: 'listing_grid',
                    config: {
                        module: 'sale',
                        columns: 2,
                        limit: 4,
                        showPrices: true,
                        showAddToCart: true,
                        title: 'Featured',
                    },
                },
                {
                    id: 'text',
                    type: 'text_block',
                    config: {
                        title: 'Our Philosophy',
                        content: 'We believe in timeless design and sustainable fashion that lasts.',
                        alignment: 'center',
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },

    // 2. Cinematic (Rental/Cars)
    {
        id: 'cinematic_rental',
        name: 'Cinematic Rental',
        description: 'Video-heavy background to showcase cars, equipment, or premium assets',
        module: 'rental',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        theme: {
            primaryColor: '#0a0a0a',
            secondaryColor: '#ffffff',
            accentColor: '#fbbf24',
            fontFamily: 'Inter',
            borderRadius: 'lg',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'Experience Luxury',
                        subtitle: 'Premium vehicles for any occasion',
                        buttonText: 'Check Availability',
                        buttonLink: '/rentals',
                        backgroundType: 'video',
                        backgroundValue: '',
                        overlay: true,
                        overlayOpacity: 0.5,
                    },
                },
                {
                    id: 'booking',
                    type: 'booking_widget',
                    config: {
                        mode: 'rental',
                        showTimeSlots: false,
                        minDuration: 1,
                        maxDuration: 30,
                        title: 'Choose Your Dates',
                    },
                },
                {
                    id: 'fleet',
                    type: 'listing_grid',
                    config: {
                        module: 'rental',
                        columns: 3,
                        limit: 6,
                        showPrices: true,
                        showAddToCart: false,
                        title: 'Our Fleet',
                    },
                },
                {
                    id: 'features',
                    type: 'features',
                    config: {
                        title: 'Why Rent With Us',
                        items: [
                            { icon: 'Shield', title: 'Fully Insured', description: 'Complete coverage included' },
                            { icon: 'Clock', title: '24/7 Support', description: 'Always here to help' },
                            { icon: 'MapPin', title: 'Flexible Pickup', description: 'Multiple locations' },
                        ],
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },

    // 3. Serene Spa (Service)
    {
        id: 'serene_spa',
        name: 'Serene Spa',
        description: 'Structured for scheduling, wellness, and trust building',
        module: 'service',
        image: 'https://images.unsplash.com/photo-1544161515-4af6b1d4640b?w=800',
        theme: {
            primaryColor: '#0d9488',
            secondaryColor: '#f0fdfa',
            accentColor: '#14b8a6',
            fontFamily: 'Inter',
            borderRadius: 'full',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'Relax & Rejuvenate',
                        subtitle: 'Your wellness journey starts here',
                        buttonText: 'Book Appointment',
                        buttonLink: '/book',
                        backgroundType: 'image',
                        backgroundValue: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6f?w=1920',
                        overlay: true,
                        overlayOpacity: 0.3,
                    },
                },
                {
                    id: 'services',
                    type: 'listing_grid',
                    config: {
                        module: 'service',
                        columns: 2,
                        limit: 4,
                        showPrices: true,
                        showAddToCart: false,
                        title: 'Our Services',
                    },
                },
                {
                    id: 'booking',
                    type: 'booking_widget',
                    config: {
                        mode: 'service',
                        showTimeSlots: true,
                        minDuration: 1,
                        maxDuration: 3,
                        title: 'Schedule Your Session',
                    },
                },
                {
                    id: 'testimonials',
                    type: 'testimonials',
                    config: {
                        title: 'What Clients Say',
                        items: [
                            { author: 'Sarah M.', text: 'The most relaxing experience ever!', rating: 5 },
                            { author: 'John D.', text: 'Professional and calming atmosphere.', rating: 5 },
                        ],
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },

    // 4. Real Estate (Rental/Houses)
    {
        id: 'real_estate',
        name: 'Real Estate',
        description: 'Property listings with detailed specs and gallery',
        module: 'rental',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        theme: {
            primaryColor: '#1e3a8a',
            secondaryColor: '#f8fafc',
            accentColor: '#3b82f6',
            fontFamily: 'Inter',
            borderRadius: 'md',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'Find Your Dream Home',
                        subtitle: 'Premium properties for rent and sale',
                        buttonText: 'Browse Properties',
                        buttonLink: '/properties',
                        backgroundType: 'image',
                        backgroundValue: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
                        overlay: true,
                        overlayOpacity: 0.4,
                    },
                },
                {
                    id: 'booking',
                    type: 'booking_widget',
                    config: {
                        mode: 'rental',
                        showTimeSlots: false,
                        minDuration: 30,
                        maxDuration: 365,
                        title: 'Check Availability',
                    },
                },
                {
                    id: 'properties',
                    type: 'listing_grid',
                    config: {
                        module: 'rental',
                        columns: 3,
                        limit: 6,
                        showPrices: true,
                        showAddToCart: false,
                        title: 'Featured Properties',
                    },
                },
                {
                    id: 'features',
                    type: 'features',
                    config: {
                        title: 'Our Promise',
                        items: [
                            { icon: 'Key', title: 'Verified Listings', description: 'All properties inspected' },
                            { icon: 'Headphones', title: 'Dedicated Support', description: 'Personal agent assigned' },
                            { icon: 'FileCheck', title: 'Easy Process', description: 'Streamlined paperwork' },
                        ],
                    },
                },
                {
                    id: 'contact',
                    type: 'contact',
                    config: {
                        title: 'Contact Us',
                        email: 'properties@example.com',
                        phone: '+221 77 123 4567',
                        address: 'Dakar, Senegal',
                        showForm: true,
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },

    // 5. Portfolio (Service/Freelance)
    {
        id: 'portfolio_freelance',
        name: 'Portfolio Freelance',
        description: 'Case studies, testimonials, and booking CTAs for consultants',
        module: 'service',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        theme: {
            primaryColor: '#18181b',
            secondaryColor: '#fafafa',
            accentColor: '#a855f7',
            fontFamily: 'Inter',
            borderRadius: 'lg',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'Creative Solutions',
                        subtitle: 'Turning ideas into reality',
                        buttonText: 'Book Consultation',
                        buttonLink: '/book',
                        backgroundType: 'color',
                        backgroundValue: '#18181b',
                        overlay: false,
                        overlayOpacity: 0,
                    },
                },
                {
                    id: 'services',
                    type: 'listing_grid',
                    config: {
                        module: 'service',
                        columns: 3,
                        limit: 3,
                        showPrices: true,
                        showAddToCart: false,
                        title: 'Services',
                    },
                },
                {
                    id: 'gallery',
                    type: 'gallery',
                    config: {
                        title: 'Portfolio',
                        images: [],
                        columns: 3,
                        aspectRatio: 'landscape',
                    },
                },
                {
                    id: 'testimonials',
                    type: 'testimonials',
                    config: {
                        title: 'Client Testimonials',
                        items: [
                            { author: 'Tech Startup', text: 'Exceptional work and communication.', rating: 5 },
                        ],
                    },
                },
                {
                    id: 'cta',
                    type: 'cta_banner',
                    config: {
                        title: 'Ready to Start Your Project?',
                        subtitle: 'Let\'s discuss your vision',
                        buttonText: 'Get in Touch',
                        buttonLink: '/contact',
                        backgroundColor: '#a855f7',
                        textColor: '#ffffff',
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },

    // 6. Global Catalog (Any module - high volume)
    {
        id: 'global_catalog',
        name: 'Global Catalog',
        description: 'High-volume inventory with categories and search',
        module: 'sale',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        theme: {
            primaryColor: '#171717',
            secondaryColor: '#ffffff',
            accentColor: '#00FF41',
            fontFamily: 'Inter',
            borderRadius: 'lg',
        },
        layout: {
            sections: [
                {
                    id: 'hero',
                    type: 'hero',
                    config: {
                        title: 'Everything You Need',
                        subtitle: 'Thousands of products at your fingertips',
                        buttonText: 'Start Shopping',
                        buttonLink: '/products',
                        backgroundType: 'image',
                        backgroundValue: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920',
                        overlay: true,
                        overlayOpacity: 0.5,
                    },
                },
                {
                    id: 'products_featured',
                    type: 'listing_grid',
                    config: {
                        module: 'sale',
                        columns: 4,
                        limit: 8,
                        showPrices: true,
                        showAddToCart: true,
                        title: 'Featured Products',
                    },
                },
                {
                    id: 'products_new',
                    type: 'listing_grid',
                    config: {
                        module: 'sale',
                        columns: 4,
                        limit: 8,
                        showPrices: true,
                        showAddToCart: true,
                        title: 'New Arrivals',
                    },
                },
                {
                    id: 'features',
                    type: 'features',
                    config: {
                        title: 'Shop With Confidence',
                        items: [
                            { icon: 'Truck', title: 'Fast Shipping', description: 'Delivery across Senegal' },
                            { icon: 'CreditCard', title: 'Secure Payment', description: 'Mobile money & cards' },
                            { icon: 'RefreshCw', title: 'Easy Returns', description: '30-day return policy' },
                        ],
                    },
                },
                {
                    id: 'faq',
                    type: 'faq',
                    config: {
                        title: 'FAQ',
                        items: [
                            { question: 'How long is shipping?', answer: '2-5 business days within Dakar, 5-10 days nationwide.' },
                            { question: 'Can I pay with mobile money?', answer: 'Yes! We accept Orange Money, Wave, and Free Money.' },
                        ],
                    },
                },
            ],
        },
        socialLinks: { instagram: '', snapchat: '', tiktok: '' },
    },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): TemplatePreset | undefined {
    return TEMPLATE_PRESETS.find(t => t.id === id);
}

/**
 * Get templates filtered by module type
 */
export function getTemplatesByModule(module: ModuleType): TemplatePreset[] {
    return TEMPLATE_PRESETS.filter(t => t.module === module);
}

/**
 * Get default template
 */
export function getDefaultTemplate(): TemplatePreset {
    return TEMPLATE_PRESETS[0];
}
