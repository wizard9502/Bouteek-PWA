"use client";

import { Block } from "@/lib/blocks/types";
import { AnnouncementBar } from "./AnnouncementBar";
import { HeroBlock } from "./HeroBlock";
import { MultiColumnFeatures } from "./MultiColumnFeatures";
import { FeaturedGrid } from "./FeaturedGrid";
import { TestimonialSlider } from "./TestimonialSlider";
import { GalleryGrid } from "./GalleryGrid";
import { ContactBlock } from "./ContactBlock";
import { FooterBlock } from "./FooterBlock";

interface Props {
    blocks: Block[];
    storeId?: string;
    storeName?: string;
}

export function BlockRenderer({ blocks, storeId, storeName }: Props) {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
                <p>No content blocks configured</p>
            </div>
        );
    }

    return (
        <>
            {blocks
                .filter((block) => block.enabled)
                .map((block) => {
                    switch (block.type) {
                        case "announcement_bar":
                            return (
                                <AnnouncementBar
                                    key={block.id}
                                    settings={block.settings as any}
                                />
                            );
                        case "hero":
                            return (
                                <HeroBlock key={block.id} settings={block.settings as any} />
                            );
                        case "multi_column_features":
                            return (
                                <MultiColumnFeatures
                                    key={block.id}
                                    settings={block.settings as any}
                                />
                            );
                        case "featured_grid":
                            return (
                                <FeaturedGrid
                                    key={block.id}
                                    settings={block.settings as any}
                                    storeId={storeId}
                                />
                            );
                        case "testimonial_slider":
                            return (
                                <TestimonialSlider
                                    key={block.id}
                                    settings={block.settings as any}
                                />
                            );
                        case "gallery":
                            return (
                                <GalleryGrid key={block.id} settings={block.settings as any} />
                            );
                        case "contact_block":
                            return (
                                <ContactBlock
                                    key={block.id}
                                    settings={block.settings as any}
                                />
                            );
                        case "footer":
                            return (
                                <FooterBlock
                                    key={block.id}
                                    settings={block.settings as any}
                                    storeName={storeName}
                                />
                            );
                        default:
                            return null;
                    }
                })}
        </>
    );
}
