"use client";

import { MultiColumnFeaturesSettings } from "@/lib/blocks/types";
import * as LucideIcons from "lucide-react";

interface Props {
    settings: MultiColumnFeaturesSettings;
}

export function MultiColumnFeatures({ settings }: Props) {
    const { columns } = settings;

    return (
        <section className="py-12 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className={`grid gap-8 ${columns.length === 2 ? 'grid-cols-2' :
                        columns.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                            'grid-cols-2 md:grid-cols-4'
                    }`}>
                    {columns.map((column, index) => {
                        // Dynamically get icon component
                        const IconComponent = (LucideIcons as any)[column.icon] || LucideIcons.Star;

                        return (
                            <div key={index} className="flex flex-col items-center text-center space-y-3">
                                <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center">
                                    <IconComponent className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="font-bold text-lg">{column.title}</h3>
                                <p className="text-sm text-gray-600">{column.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
