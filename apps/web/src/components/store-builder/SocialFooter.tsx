"use client";

import React from 'react';
import Link from 'next/link';
import { SocialLinks } from '@/lib/store-builder/section-schemas';

interface SocialFooterProps {
    socialLinks?: SocialLinks;
    storeName?: string;
    primaryColor?: string;
    accentColor?: string;
    showPoweredBy?: boolean;
}

// SVG icons for social platforms
const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const SnapchatIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.076-.375-.089-.883-.194-1.513-.194-.6 0-1.05.074-1.336.138-.27.074-.51.18-.72.273-.585.27-1.094.496-2.057.496-1.008 0-1.517-.24-2.057-.496-.21-.104-.449-.198-.72-.273-.285-.064-.735-.138-1.335-.138-.63 0-1.14.105-1.515.194-.225.045-.4.076-.536.076-.33 0-.525-.15-.585-.4-.061-.195-.105-.376-.135-.556-.044-.195-.104-.479-.164-.57-1.87-.283-2.904-.702-3.144-1.271-.03-.076-.046-.15-.046-.225-.015-.24.166-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.044-.242-.09-.346-.119-.825-.329-1.228-.719-1.228-1.168 0-.36.284-.689.735-.838.15-.061.328-.09.509-.09.121 0 .3.015.465.104.359.179.715.301.959.301.271 0 .389-.09.445-.119l-.016-.06c-.104-1.627-.225-3.654.3-4.847C7.711 1.069 11.084.793 12.086.793h.12z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

/**
 * SocialFooter - Footer with social icons and Powered by Bouteek
 */
export function SocialFooter({
    socialLinks = { instagram: '', snapchat: '', tiktok: '' },
    storeName = 'Store',
    primaryColor = '#000000',
    accentColor = '#00FF41',
    showPoweredBy = true,
}: SocialFooterProps) {
    const hasSocialLinks =
        socialLinks.instagram || socialLinks.snapchat || socialLinks.tiktok;

    return (
        <footer
            className="w-full py-12 px-6"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Social Icons */}
                {hasSocialLinks && (
                    <div className="flex justify-center items-center gap-6 mb-8">
                        {socialLinks.instagram && (
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white transition-colors transform hover:scale-110"
                                aria-label="Instagram"
                            >
                                <InstagramIcon />
                            </a>
                        )}
                        {socialLinks.snapchat && (
                            <a
                                href={socialLinks.snapchat}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white transition-colors transform hover:scale-110"
                                aria-label="Snapchat"
                            >
                                <SnapchatIcon />
                            </a>
                        )}
                        {socialLinks.tiktok && (
                            <a
                                href={socialLinks.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white transition-colors transform hover:scale-110"
                                aria-label="TikTok"
                            >
                                <TikTokIcon />
                            </a>
                        )}
                    </div>
                )}

                {/* Store name */}
                <div className="text-center mb-6">
                    <p className="text-white/40 text-sm font-medium">
                        © {new Date().getFullYear()} {storeName}
                    </p>
                </div>

                {/* Powered by Bouteek */}
                {showPoweredBy && (
                    <div className="text-center pt-6 border-t border-white/10">
                        <a
                            href="https://bouteek.shop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
                        >
                            <span>Powered by</span>
                            <span
                                className="font-black tracking-tight"
                                style={{ color: accentColor }}
                            >
                                Bouteek
                            </span>
                        </a>
                    </div>
                )}
            </div>
        </footer>
    );
}

export default SocialFooter;
