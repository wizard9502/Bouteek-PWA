"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { cn } from '@/lib/utils';

interface TextBlockConfig {
    title?: string;
    content: string;
    alignment: 'left' | 'center' | 'right';
}

/**
 * TextBlockSection - Rich text content section
 */
export function TextBlockSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const textConfig = config as TextBlockConfig;

    const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <section className="py-12 px-6">
            <div className={cn('max-w-3xl mx-auto', alignmentClasses[textConfig.alignment || 'left'])}>
                {/* Title */}
                {textConfig.title && (
                    <h2 className="text-2xl font-black mb-4">{textConfig.title}</h2>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {textConfig.content || (isEditing ? 'Add your content here...' : '')}
                    </p>
                </div>
            </div>
        </section>
    );
}

// Register component
registerComponent('text_block', TextBlockSection);

export default TextBlockSection;
