"use client";

import { ComponentType } from 'react';

// Section configuration types
export interface SectionConfig {
    id: string;
    type: SectionType;
    config: Record<string, any>;
    visible?: boolean;
    hideOnMobile?: boolean;
}

export type SectionType =
    | 'hero'
    | 'listing_grid'
    | 'video'
    | 'testimonials'
    | 'booking_widget'
    | 'cta_banner'
    | 'text_block'
    | 'features'
    | 'gallery'
    | 'contact'
    | 'faq';

export type ModuleType = 'sale' | 'rental' | 'service';

// Base props all section components receive
export interface BaseSectionProps {
    config: Record<string, any>;
    moduleType: ModuleType;
    isEditing?: boolean;
    onConfigChange?: (config: Record<string, any>) => void;
}

// Lazy imports to avoid circular dependencies - components will self-register
const componentMap = new Map<SectionType, ComponentType<BaseSectionProps>>();

/**
 * Register a component for a section type
 */
export function registerComponent(
    type: SectionType,
    component: ComponentType<BaseSectionProps>
) {
    componentMap.set(type, component);
}

/**
 * Get a component for a section type
 */
export function getComponent(type: SectionType): ComponentType<BaseSectionProps> | null {
    return componentMap.get(type) || null;
}

/**
 * Get all registered section types
 */
export function getRegisteredTypes(): SectionType[] {
    return Array.from(componentMap.keys());
}

/**
 * Section metadata for the editor UI
 */
export interface SectionMeta {
    type: SectionType;
    label: string;
    description: string;
    icon: string;
    category: 'content' | 'media' | 'commerce' | 'engagement';
    defaultConfig: Record<string, any>;
}

export const SECTION_METADATA: SectionMeta[] = [
    {
        type: 'hero',
        label: 'Hero Banner',
        description: 'Full-width hero with headline, subtitle, and CTA',
        icon: 'Layout',
        category: 'content',
        defaultConfig: {
            title: 'Welcome to Our Store',
            subtitle: 'Discover amazing products',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            backgroundType: 'image', // 'image' | 'video' | 'color'
            backgroundValue: '',
            overlay: true,
            overlayOpacity: 0.3,
        },
    },
    {
        type: 'listing_grid',
        label: 'Product Grid',
        description: 'Display products, rentals, or services',
        icon: 'Grid3X3',
        category: 'commerce',
        defaultConfig: {
            module: 'sale', // 'sale' | 'rental' | 'service'
            columns: 2,
            limit: 8,
            showPrices: true,
            showAddToCart: true,
            category: null,
        },
    },
    {
        type: 'video',
        label: 'Video Section',
        description: 'Embed YouTube, Vimeo, or MP4 video',
        icon: 'Play',
        category: 'media',
        defaultConfig: {
            videoUrl: '',
            autoplay: false,
            muted: true,
            loop: true,
            title: '',
            description: '',
        },
    },
    {
        type: 'testimonials',
        label: 'Testimonials',
        description: 'Customer reviews and social proof',
        icon: 'Quote',
        category: 'engagement',
        defaultConfig: {
            title: 'What Our Customers Say',
            items: [
                { author: 'Customer', text: 'Great service!', rating: 5 },
            ],
        },
    },
    {
        type: 'booking_widget',
        label: 'Booking Widget',
        description: 'Date/time picker for rentals and services',
        icon: 'Calendar',
        category: 'commerce',
        defaultConfig: {
            mode: 'rental', // 'rental' | 'service'
            showTimeSlots: true,
            minDuration: 1,
            maxDuration: 30,
        },
    },
    {
        type: 'cta_banner',
        label: 'CTA Banner',
        description: 'Call-to-action banner with button',
        icon: 'Megaphone',
        category: 'content',
        defaultConfig: {
            title: 'Ready to get started?',
            subtitle: 'Join thousands of happy customers',
            buttonText: 'Get Started',
            buttonLink: '/signup',
            backgroundColor: '#000000',
            textColor: '#ffffff',
        },
    },
    {
        type: 'text_block',
        label: 'Text Block',
        description: 'Rich text content section',
        icon: 'Type',
        category: 'content',
        defaultConfig: {
            title: '',
            content: '',
            alignment: 'left',
        },
    },
    {
        type: 'features',
        label: 'Features Grid',
        description: 'Highlight key features or benefits',
        icon: 'Star',
        category: 'content',
        defaultConfig: {
            title: 'Why Choose Us',
            items: [
                { icon: 'Check', title: 'Quality', description: 'Premium products' },
                { icon: 'Truck', title: 'Fast Delivery', description: 'Quick shipping' },
                { icon: 'Shield', title: 'Secure', description: 'Safe payments' },
            ],
        },
    },
    {
        type: 'gallery',
        label: 'Image Gallery',
        description: 'Grid of images with lightbox',
        icon: 'Images',
        category: 'media',
        defaultConfig: {
            images: [],
            columns: 3,
            aspectRatio: 'square',
        },
    },
    {
        type: 'contact',
        label: 'Contact Section',
        description: 'Contact form and info',
        icon: 'Mail',
        category: 'engagement',
        defaultConfig: {
            title: 'Get in Touch',
            email: '',
            phone: '',
            address: '',
            showForm: true,
        },
    },
    {
        type: 'faq',
        label: 'FAQ',
        description: 'Frequently asked questions',
        icon: 'HelpCircle',
        category: 'engagement',
        defaultConfig: {
            title: 'Frequently Asked Questions',
            items: [
                { question: 'How does shipping work?', answer: 'We ship worldwide...' },
            ],
        },
    },
];

/**
 * Get metadata for a section type
 */
export function getSectionMeta(type: SectionType): SectionMeta | undefined {
    return SECTION_METADATA.find(m => m.type === type);
}

/**
 * Get default config for a section type
 */
export function getDefaultConfig(type: SectionType): Record<string, any> {
    const meta = getSectionMeta(type);
    return meta?.defaultConfig || {};
}
