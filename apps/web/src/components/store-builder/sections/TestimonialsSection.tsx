"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialsConfig {
    title: string;
    items: Array<{
        author: string;
        text: string;
        rating: number;
        avatar?: string;
    }>;
}

/**
 * TestimonialsSection - Customer reviews and social proof
 */
export function TestimonialsSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const testimonialsConfig = config as TestimonialsConfig;
    const items = testimonialsConfig.items || [];

    return (
        <section className="py-16 px-6 bg-muted/30">
            <div className="max-w-4xl mx-auto">
                {/* Title */}
                <h2 className="text-2xl font-black text-center mb-10">
                    {testimonialsConfig.title || 'What Our Customers Say'}
                </h2>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-3xl p-6 border shadow-sm"
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={cn(
                                            i < item.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-muted text-muted"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm leading-relaxed mb-6 italic opacity-80">
                                "{item.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                                    {item.avatar ? (
                                        <img
                                            src={item.avatar}
                                            alt={item.author}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        item.author.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <p className="font-bold text-sm">{item.author}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state for editing */}
                {isEditing && items.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                        <p className="font-bold">No testimonials added</p>
                        <p className="text-sm">Add customer reviews in the section settings</p>
                    </div>
                )}
            </div>
        </section>
    );
}

// Register component
registerComponent('testimonials', TestimonialsSection);

export default TestimonialsSection;
