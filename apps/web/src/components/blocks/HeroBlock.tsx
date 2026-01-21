"use client";

import { HeroSettings } from "@/lib/blocks/types";
import { Button } from "@/components/ui/button";

interface Props {
    settings: HeroSettings;
}

export function HeroBlock({ settings }: Props) {
    const { backgroundImage, headline, subtitle, buttonText, buttonLink, overlayOpacity } = settings;

    return (
        <section
            className="relative w-full min-h-[60vh] flex items-center justify-center text-white overflow-hidden"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                    {headline}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto">
                        {subtitle}
                    </p>
                )}
                {buttonText && (
                    <Button
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg font-bold bg-white text-black hover:bg-gray-100"
                        asChild
                    >
                        <a href={buttonLink || "#"}>{buttonText}</a>
                    </Button>
                )}
            </div>
        </section>
    );
}
