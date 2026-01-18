"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface TawkToChatProps {
    user?: {
        name?: string;
        email?: string;
    } | null;
}

export function TawkToChat({ user }: TawkToChatProps) {
    const pathname = usePathname();
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;

        // Tawk.to Script Injection
        var Tawk_API: any = (window as any).Tawk_API || {};
        var Tawk_LoadStart = new Date();
        (function () {
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/695f8958ca4644197ef6b516/1jeg2jd36';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
        })();
    }, []);

    useEffect(() => {
        // Set User Data when available
        if (user) {
            const api = (window as any).Tawk_API;
            if (api) {
                api.visitor = {
                    name: user.name,
                    email: user.email
                };
            }
        }
    }, [user]);

    useEffect(() => {
        // Show/Hide Logic based on Pathname
        const checkTawk = setInterval(() => {
            const api = (window as any).Tawk_API;
            if (api && typeof api.showWidget === 'function') {
                // Logic: Only show on /settings and /profile
                if (pathname.includes('/settings') || pathname.includes('/profile')) {
                    api.showWidget();
                } else {
                    api.hideWidget();
                }

                // We don't clear interval because we want this to retry until it loads,
                // BUT this effect runs on pathname change.
                clearInterval(checkTawk);
            }
        }, 300);

        return () => clearInterval(checkTawk);
    }, [pathname]);

    return null;
}
