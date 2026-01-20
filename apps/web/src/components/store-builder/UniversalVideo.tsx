"use client";

import React, { useMemo } from 'react';
import { Play } from 'lucide-react';

interface UniversalVideoProps {
    url: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    className?: string;
    aspectRatio?: 'video' | 'square' | 'portrait';
    overlay?: boolean;
}

type VideoType = 'youtube' | 'vimeo' | 'mp4' | 'unknown';

/**
 * UniversalVideo - Auto-detects and embeds YouTube, Vimeo, or MP4 videos
 */
export function UniversalVideo({
    url,
    autoplay = false,
    muted = true,
    loop = true,
    controls = false,
    className = '',
    aspectRatio = 'video',
    overlay = false,
}: UniversalVideoProps) {
    const videoInfo = useMemo(() => detectVideoType(url), [url]);

    if (!url || videoInfo.type === 'unknown') {
        return (
            <div className={`bg-muted flex items-center justify-center ${className}`}>
                <div className="text-center text-muted-foreground p-8">
                    <Play size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium">Enter a video URL</p>
                    <p className="text-xs opacity-60">YouTube, Vimeo, or MP4</p>
                </div>
            </div>
        );
    }

    const aspectClasses = {
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[9/16]',
    };

    return (
        <div className={`relative overflow-hidden ${aspectClasses[aspectRatio]} ${className}`}>
            {videoInfo.type === 'youtube' && (
                <iframe
                    src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${videoInfo.id}&controls=${controls ? 1 : 0}&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    frameBorder="0"
                />
            )}

            {videoInfo.type === 'vimeo' && (
                <iframe
                    src={`https://player.vimeo.com/video/${videoInfo.id}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}&background=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    frameBorder="0"
                />
            )}

            {videoInfo.type === 'mp4' && (
                <video
                    src={url}
                    autoPlay={autoplay}
                    muted={muted}
                    loop={loop}
                    controls={controls}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Optional overlay for hero backgrounds */}
            {overlay && (
                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            )}
        </div>
    );
}

/**
 * Detect video type from URL
 */
function detectVideoType(url: string): { type: VideoType; id: string } {
    if (!url) return { type: 'unknown', id: '' };

    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) return { type: 'youtube', id: match[1] };
    }

    // Vimeo patterns
    const vimeoPatterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of vimeoPatterns) {
        const match = url.match(pattern);
        if (match) return { type: 'vimeo', id: match[1] };
    }

    // MP4 direct link
    if (/\.mp4(\?.*)?$/i.test(url)) {
        return { type: 'mp4', id: url };
    }

    return { type: 'unknown', id: '' };
}

/**
 * Helper to check if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
    const info = detectVideoType(url);
    return info.type !== 'unknown';
}

/**
 * Get video thumbnail URL (for preview)
 */
export function getVideoThumbnail(url: string): string | null {
    const info = detectVideoType(url);

    if (info.type === 'youtube') {
        return `https://img.youtube.com/vi/${info.id}/hqdefault.jpg`;
    }

    // Vimeo requires API call for thumbnail, return null
    if (info.type === 'vimeo') {
        return null;
    }

    return null;
}

export default UniversalVideo;
