import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface InstagramPost {
    id: string;
    imageUrl: string;
    caption?: string;
    link?: string;
}

interface InstagramFeedProps {
    title?: string;
    username?: string;
    posts?: InstagramPost[];
    accentColor?: string;
    gridCols?: 2 | 3 | 4;
}

export function InstagramFeed({
    title = "Follow Us on Instagram",
    username = "@yourstore",
    posts = [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', caption: 'New arrivals' },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', caption: 'Featured product' },
        { id: '3', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', caption: 'Best seller' },
        { id: '4', imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400', caption: 'Limited edition' },
        { id: '5', imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400', caption: 'Style guide' },
        { id: '6', imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400', caption: 'Behind the scenes' }
    ],
    accentColor = "#E1306C",
    gridCols = 3
}: InstagramFeedProps) {
    return (
        <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Instagram size={32} style={{ color: accentColor }} />
                        <h2 className="text-3xl font-black">{title}</h2>
                    </div>
                    <a
                        href={`https://instagram.com/${username.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lg font-bold hover:underline"
                        style={{ color: accentColor }}
                    >
                        {username}
                        <ExternalLink size={16} />
                    </a>
                </div>

                <div className={`grid grid-cols-${gridCols} gap-4`}>
                    {posts.map((post, index) => (
                        <motion.a
                            key={post.id}
                            href={post.link || `https://instagram.com/${username.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-2xl overflow-hidden group relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <img
                                src={post.imageUrl}
                                alt={post.caption || `Instagram post ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Instagram
                                    size={48}
                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
