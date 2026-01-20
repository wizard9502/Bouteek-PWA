"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    const PULL_THRESHOLD = 80;

    useEffect(() => {
        let startY = 0;
        let currentY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            // Only activate if at top of scroll
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && startY > 0) {
                currentY = e.touches[0].clientY;
                const distance = currentY - startY;

                if (distance > 0) {
                    e.preventDefault();
                    setPullDistance(Math.min(distance, 150));
                    setPulling(distance > PULL_THRESHOLD);
                }
            }
        };

        const handleTouchEnd = async () => {
            if (pullDistance > PULL_THRESHOLD && !refreshing) {
                setRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setTimeout(() => {
                        setRefreshing(false);
                        setPulling(false);
                        setPullDistance(0);
                    }, 500);
                }
            } else {
                setPulling(false);
                setPullDistance(0);
            }
            startY = 0;
        };

        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [pullDistance, refreshing, onRefresh]);

    return (
        <div className="relative">
            {/* Pull indicator */}
            <div
                className={cn(
                    "fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-200",
                    pullDistance > 0 ? "opacity-100" : "opacity-0"
                )}
                style={{ transform: `translateY(${Math.min(pullDistance - 40, 60)}px) translateX(-50%)` }}
            >
                <div className="bg-bouteek-green text-black p-3 rounded-full shadow-lg">
                    <RefreshCw
                        className={cn(
                            "transition-transform",
                            refreshing && "animate-spin",
                            pulling && "rotate-180"
                        )}
                        size={24}
                    />
                </div>
            </div>

            {children}
        </div>
    );
}
