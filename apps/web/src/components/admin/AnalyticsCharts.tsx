"use client";

// TEMPORARY FIX: Recharts is causing SSR build crashes on Next.js 16 / React 19.
// Replacing with static placeholders to unblock deployment.
// TODO: Re-enable or switch to a compatible library once stable.

import { Card } from "@/components/ui/card";

interface RevenueChartProps {
    data: any[];
}

export function RevenueGrowthChart({ data }: RevenueChartProps) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-center">
                <p className="font-bold text-gray-400">Revenue Growth Chart</p>
                <p className="text-xs text-gray-300 mt-1">Visualization temporarily disabled for build stability</p>
                <div className="mt-4 text-xs font-mono text-gray-400">
                    Data Points: {data.length}
                </div>
            </div>
        </div>
    );
}

interface SubscriptionChartProps {
    data: any[];
}

export function SubscriptionDistributionChart({ data }: SubscriptionChartProps) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-center">
                <p className="font-bold text-gray-400">Subscription Distribution</p>
                <p className="text-xs text-gray-300 mt-1">Visualization temporarily disabled for build stability</p>
            </div>
        </div>
    );
}
