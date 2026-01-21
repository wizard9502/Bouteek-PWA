"use client";

import { GallerySettings } from "@/lib/blocks/types";

interface Props {
    settings: GallerySettings;
}

export function GalleryGrid({ settings }: Props) {
    const { title, images, columns } = settings;

    if (!images || images.length === 0) {
        return null;
    }

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4",
    };

    return (
        <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {title && (
                    <h2 className="text-2xl md:text-3xl font-black mb-8">{title}</h2>
                )}

                <div className={`grid gap-4 ${gridCols[columns]}`}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
                        >
                            <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
