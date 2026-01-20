"use client";

import React, { useMemo } from 'react';
import { SectionConfig, ModuleType, getComponent, BaseSectionProps } from '@/lib/store-builder/component-registry';
import { cn } from '@/lib/utils';

interface SchemaRendererProps {
    sections: SectionConfig[];
    moduleType: ModuleType;
    isEditing?: boolean;
    onSectionClick?: (sectionId: string) => void;
    onConfigChange?: (sectionId: string, config: Record<string, any>) => void;
    selectedSectionId?: string;
}

/**
 * SchemaRenderer - Recursive engine that reads layout JSON and renders UI
 * This is the core of the schema-driven architecture
 */
export function SchemaRenderer({
    sections,
    moduleType,
    isEditing = false,
    onSectionClick,
    onConfigChange,
    selectedSectionId,
}: SchemaRendererProps) {
    const visibleSections = useMemo(() => {
        return sections.filter(section => section.visible !== false);
    }, [sections]);

    return (
        <div className="w-full">
            {visibleSections.map((section) => (
                <SectionWrapper
                    key={section.id}
                    section={section}
                    moduleType={moduleType}
                    isEditing={isEditing}
                    isSelected={selectedSectionId === section.id}
                    onClick={() => onSectionClick?.(section.id)}
                    onConfigChange={(config) => onConfigChange?.(section.id, config)}
                />
            ))}
        </div>
    );
}

interface SectionWrapperProps {
    section: SectionConfig;
    moduleType: ModuleType;
    isEditing: boolean;
    isSelected: boolean;
    onClick?: () => void;
    onConfigChange?: (config: Record<string, any>) => void;
}

function SectionWrapper({
    section,
    moduleType,
    isEditing,
    isSelected,
    onClick,
    onConfigChange,
}: SectionWrapperProps) {
    const Component = getComponent(section.type);

    // If component not registered, render placeholder in edit mode
    if (!Component) {
        if (isEditing) {
            return (
                <div
                    className={cn(
                        "p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground",
                        isSelected && "border-bouteek-green bg-bouteek-green/5"
                    )}
                    onClick={onClick}
                >
                    <p className="font-bold">Unknown Section: {section.type}</p>
                    <p className="text-sm">This section type is not registered</p>
                </div>
            );
        }
        return null;
    }

    const sectionProps: BaseSectionProps = {
        config: section.config,
        moduleType,
        isEditing,
        onConfigChange,
    };

    // In editing mode, wrap with selection border
    if (isEditing) {
        return (
            <div
                className={cn(
                    "relative group transition-all",
                    isSelected && "ring-2 ring-bouteek-green ring-offset-2"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
            >
                {/* Edit indicator */}
                <div
                    className={cn(
                        "absolute top-2 left-2 z-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        "bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity",
                        isSelected && "opacity-100 bg-bouteek-green text-black"
                    )}
                >
                    {section.type.replace('_', ' ')}
                </div>

                {/* Actual component */}
                <Component {...sectionProps} />
            </div>
        );
    }

    // Normal render
    return <Component {...sectionProps} />;
}

/**
 * Helper to create a new section with default config
 */
export function createSection(
    type: SectionConfig['type'],
    config: Record<string, any> = {}
): SectionConfig {
    return {
        id: `${type}_${Date.now()}`,
        type,
        config,
        visible: true,
        hideOnMobile: false,
    };
}

/**
 * Helper to reorder sections
 */
export function reorderSections(
    sections: SectionConfig[],
    fromIndex: number,
    toIndex: number
): SectionConfig[] {
    const result = [...sections];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
}

/**
 * Helper to remove a section
 */
export function removeSection(
    sections: SectionConfig[],
    sectionId: string
): SectionConfig[] {
    return sections.filter(s => s.id !== sectionId);
}

/**
 * Helper to update section config
 */
export function updateSectionConfig(
    sections: SectionConfig[],
    sectionId: string,
    config: Partial<SectionConfig['config']>
): SectionConfig[] {
    return sections.map(s =>
        s.id === sectionId
            ? { ...s, config: { ...s.config, ...config } }
            : s
    );
}

export default SchemaRenderer;
