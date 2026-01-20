"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Check, Truck, Shield, Clock, Star, Key, Headphones, FileCheck, RefreshCw, CreditCard, MapPin } from 'lucide-react';

interface FeaturesConfig {
    title: string;
    items: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

// Icon map
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Check,
    Truck,
    Shield,
    Clock,
    Star,
    Key,
    Headphones,
    FileCheck,
    RefreshCw,
    CreditCard,
    MapPin,
};

/**
 * FeaturesSection - Highlight key features or benefits
 */
export function FeaturesSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const featuresConfig = config as FeaturesConfig;
    const items = featuresConfig.items || [];

    return (
        <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Title */}
                <h2 className="text-2xl font-black text-center mb-12">
                    {featuresConfig.title || 'Why Choose Us'}
                </h2>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {items.map((item, index) => {
                        const IconComponent = ICONS[item.icon] || Check;

                        return (
                            <div key={index} className="text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                    <IconComponent size={28} />
                                </div>

                                {/* Title */}
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Empty state for editing */}
                {isEditing && items.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                        <p className="font-bold">No features added</p>
                        <p className="text-sm">Add features in the section settings</p>
                    </div>
                )}
            </div>
        </section>
    );
}

// Register component
registerComponent('features', FeaturesSection);

export default FeaturesSection;
