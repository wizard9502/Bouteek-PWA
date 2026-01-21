"use client";

import { AnnouncementBarSettings } from "@/lib/blocks/types";

interface Props {
    settings: AnnouncementBarSettings;
}

export function AnnouncementBar({ settings }: Props) {
    const { text, bgColor, textColor, link } = settings;

    const content = (
        <div
            className="w-full py-2 px-4 text-center text-sm font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {text}
        </div>
    );

    if (link) {
        return (
            <a href={link} className="block hover:opacity-90 transition-opacity">
                {content}
            </a>
        );
    }

    return content;
}
