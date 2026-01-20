"use client";

import React, { useEffect } from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { UniversalVideo } from '../UniversalVideo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, ArrowRight } from 'lucide-react';

interface HeroConfig {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundType: 'image' | 'video' | 'color';
    backgroundValue: string;
    overlay: boolean;
    overlayOpacity: number;
}

/**
 * HeroSection - Full-width hero banner with module-specific adaptations
 */
export function HeroSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const heroConfig = config as HeroConfig;

    // Module-specific CTA button
    const getModuleCTA = () => {
        switch (moduleType) {
            case 'rental':
                return (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90"
                            onClick={() => !isEditing && (window.location.href = heroConfig.buttonLink)}
                        >
                            <Calendar className="mr-2" size={18} />
                            Check Availability
                        </Button>
                    </div>
                );
            case 'service':
                return (
                    <Button
                        className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90"
                        onClick={() => !isEditing && (window.location.href = heroConfig.buttonLink)}
                    >
                        Book Appointment
                        <ArrowRight className="ml-2" size={18} />
                    </Button>
                );
            default:
                return (
                    <Button
                        className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-wider bg-white text-black hover:bg-white/90"
                        onClick={() => !isEditing && (window.location.href = heroConfig.buttonLink)}
                    >
                        {heroConfig.buttonText || 'Shop Now'}
                        <ArrowRight className="ml-2" size={18} />
                    </Button>
                );
        }
    };

    return (
        <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            {heroConfig.backgroundType === 'video' && heroConfig.backgroundValue && (
                <div className="absolute inset-0">
                    <UniversalVideo
                        url={heroConfig.backgroundValue}
                        autoplay
                        muted
                        loop
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {heroConfig.backgroundType === 'image' && heroConfig.backgroundValue && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroConfig.backgroundValue})` }}
                />
            )}

            {heroConfig.backgroundType === 'color' && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: heroConfig.backgroundValue || '#000000' }}
                />
            )}

            {/* Overlay */}
            {heroConfig.overlay && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: heroConfig.overlayOpacity || 0.3 }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
                    {heroConfig.title || 'Welcome'}
                </h1>
                {heroConfig.subtitle && (
                    <p className="text-lg md:text-xl opacity-90 mb-8 font-medium">
                        {heroConfig.subtitle}
                    </p>
                )}
                {getModuleCTA()}
            </div>
        </section>
    );
}

// Register component
registerComponent('hero', HeroSection);

export default HeroSection;
