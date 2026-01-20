"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTABannerConfig {
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonLink: string;
    backgroundColor: string;
    textColor: string;
}

/**
 * CTABannerSection - Call-to-action banner with button
 */
export function CTABannerSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const ctaConfig = config as CTABannerConfig;

    return (
        <section
            className="py-16 px-6"
            style={{ backgroundColor: ctaConfig.backgroundColor || '#000000' }}
        >
            <div className="max-w-3xl mx-auto text-center">
                {/* Title */}
                <h2
                    className="text-3xl md:text-4xl font-black mb-4"
                    style={{ color: ctaConfig.textColor || '#ffffff' }}
                >
                    {ctaConfig.title || 'Ready to get started?'}
                </h2>

                {/* Subtitle */}
                {ctaConfig.subtitle && (
                    <p
                        className="text-lg mb-8 opacity-80"
                        style={{ color: ctaConfig.textColor || '#ffffff' }}
                    >
                        {ctaConfig.subtitle}
                    </p>
                )}

                {/* Button */}
                <Button
                    className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                    style={{
                        backgroundColor: ctaConfig.textColor || '#ffffff',
                        color: ctaConfig.backgroundColor || '#000000',
                    }}
                    onClick={() => !isEditing && (window.location.href = ctaConfig.buttonLink)}
                >
                    {ctaConfig.buttonText || 'Get Started'}
                    <ArrowRight className="ml-2" size={18} />
                </Button>
            </div>
        </section>
    );
}

// Register component
registerComponent('cta_banner', CTABannerSection);

export default CTABannerSection;
