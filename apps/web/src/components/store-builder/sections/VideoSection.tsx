"use client";

import React from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { UniversalVideo } from '../UniversalVideo';

interface VideoSectionConfig {
    videoUrl: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    title?: string;
    description?: string;
}

/**
 * VideoSection - Embed YouTube, Vimeo, or MP4 video
 */
export function VideoSection({ config, moduleType, isEditing }: BaseSectionProps) {
    const videoConfig = config as VideoSectionConfig;

    return (
        <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Title & Description */}
                {(videoConfig.title || videoConfig.description) && (
                    <div className="text-center mb-8">
                        {videoConfig.title && (
                            <h2 className="text-2xl font-black mb-2">{videoConfig.title}</h2>
                        )}
                        {videoConfig.description && (
                            <p className="text-muted-foreground">{videoConfig.description}</p>
                        )}
                    </div>
                )}

                {/* Video Player */}
                <div className="rounded-3xl overflow-hidden shadow-xl">
                    <UniversalVideo
                        url={videoConfig.videoUrl}
                        autoplay={videoConfig.autoplay}
                        muted={videoConfig.muted}
                        loop={videoConfig.loop}
                        controls
                        aspectRatio="video"
                    />
                </div>
            </div>
        </section>
    );
}

// Register component
registerComponent('video', VideoSection);

export default VideoSection;
