"use client";

import { TestimonialSliderSettings } from "@/lib/blocks/types";
import { Star } from "lucide-react";

interface Props {
    settings: TestimonialSliderSettings;
}

export function TestimonialSlider({ settings }: Props) {
    const { title, testimonials } = settings;

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-12 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-black text-center mb-8">{title}</h2>
                )}

                <div className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {testimonial.avatar ? (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        testimonial.name.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div className="flex-1">
                                    {/* Rating */}
                                    <div className="flex gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < testimonial.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Text */}
                                    <p className="text-gray-700 italic mb-2">"{testimonial.text}"</p>

                                    {/* Name */}
                                    <p className="text-sm font-bold text-gray-900">
                                        — {testimonial.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
