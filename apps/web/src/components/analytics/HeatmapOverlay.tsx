"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ClickPoint {
    x: number;
    y: number;
    count?: number;
}

interface HeatmapOverlayProps {
    /** Array of click coordinates */
    clickData: ClickPoint[];
    /** Width of the container */
    width: number;
    /** Height of the container */
    height: number;
    /** Opacity of the overlay (0-1) */
    opacity?: number;
    /** Radius of each heat point */
    pointRadius?: number;
    /** Whether the overlay is visible */
    visible?: boolean;
}

/**
 * Canvas-based heatmap overlay for visualizing click patterns.
 * Renders a thermal color gradient (red = hot, blue = cold).
 */
export function HeatmapOverlay({
    clickData,
    width,
    height,
    opacity = 0.6,
    pointRadius = 40,
    visible = true,
}: HeatmapOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !visible || clickData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Find max count for normalization
        const maxCount = Math.max(...clickData.map(p => p.count || 1), 1);

        // Create offscreen canvas for compositing
        const offscreen = document.createElement("canvas");
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext("2d");
        if (!octx) return;

        // Draw heat points with additive blending
        clickData.forEach(point => {
            const intensity = (point.count || 1) / maxCount;
            const gradient = octx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, pointRadius
            );

            // Intensity affects alpha
            const alpha = Math.min(1, intensity * 0.8 + 0.2);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
            gradient.addColorStop(0.4, `rgba(255, 255, 0, ${alpha * 0.6})`);
            gradient.addColorStop(0.7, `rgba(0, 255, 0, ${alpha * 0.3})`);
            gradient.addColorStop(1, "rgba(0, 0, 255, 0)");

            octx.fillStyle = gradient;
            octx.fillRect(
                point.x - pointRadius,
                point.y - pointRadius,
                pointRadius * 2,
                pointRadius * 2
            );
        });

        // Copy to main canvas with opacity
        ctx.globalAlpha = opacity;
        ctx.drawImage(offscreen, 0, 0);
        ctx.globalAlpha = 1;

        setIsReady(true);
    }, [clickData, width, height, opacity, pointRadius, visible]);

    if (!visible) return null;

    return (
        <motion.canvas
            ref={canvasRef}
            width={width}
            height={height}
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: "multiply" }}
        />
    );
}

interface HeatmapLegendProps {
    className?: string;
}

/**
 * Legend showing the heatmap color scale.
 */
export function HeatmapLegend({ className = "" }: HeatmapLegendProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-xs font-medium text-muted-foreground">Cold</span>
            <div
                className="w-24 h-3 rounded-full"
                style={{
                    background: "linear-gradient(to right, #0000ff, #00ff00, #ffff00, #ff0000)"
                }}
            />
            <span className="text-xs font-medium text-muted-foreground">Hot</span>
        </div>
    );
}

interface ClickTrackerProps {
    /** Merchant ID to associate clicks with */
    merchantId: string;
    /** Whether tracking is enabled */
    enabled?: boolean;
    /** Callback when a click is captured */
    onCapture?: (point: ClickPoint) => void;
    children: React.ReactNode;
}

/**
 * Wrapper component that captures click coordinates for analytics.
 * Sends data to the analytics_events table.
 */
export function ClickTracker({
    merchantId,
    enabled = true,
    onCapture,
    children,
}: ClickTrackerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const handleClick = async (e: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const point: ClickPoint = {
                x: Math.round(e.clientX - rect.left),
                y: Math.round(e.clientY - rect.top),
            };

            onCapture?.(point);

            // Send to analytics (fire and forget)
            try {
                const { supabase } = await import("@/lib/supabaseClient");
                await supabase.from("analytics_events").insert({
                    merchant_id: merchantId,
                    event_type: "click",
                    page_path: window.location.pathname,
                    x_coord: point.x,
                    y_coord: point.y,
                    metadata: {
                        viewport_width: window.innerWidth,
                        viewport_height: window.innerHeight,
                    },
                });
            } catch (error) {
                console.error("Failed to log click:", error);
            }
        };

        const container = containerRef.current;
        container.addEventListener("click", handleClick);

        return () => {
            container.removeEventListener("click", handleClick);
        };
    }, [enabled, merchantId, onCapture]);

    return (
        <div ref={containerRef} className="relative">
            {children}
        </div>
    );
}
