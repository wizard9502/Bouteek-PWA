"use client";

import { ReactNode } from "react";
import { useFeature, useLimit } from "@/hooks/useFeature";
import { usePermissions } from "@/hooks/usePermissions";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeatureGateProps {
    /** Feature name to check against the plan */
    feature: string;
    /** Content to render if feature is enabled */
    children: ReactNode;
    /** Optional fallback content. If not provided, shows upgrade prompt */
    fallback?: ReactNode;
    /** If true, shows a subtle lock overlay instead of replacing content */
    overlay?: boolean;
    /** Custom upgrade message */
    upgradeMessage?: string;
}

interface LimitGateProps {
    /** Limit name to check (e.g., 'products', 'staff') */
    limit: string;
    /** Current count of items */
    currentCount: number;
    /** Content to render if within limit */
    children: ReactNode;
    /** Optional fallback content */
    fallback?: ReactNode;
    /** Custom limit message */
    limitMessage?: string;
}

/**
 * Component to gate features based on plan permissions.
 * Shows upgrade prompt when feature is not available.
 */
export function FeatureGate({
    feature,
    children,
    fallback,
    overlay = false,
    upgradeMessage
}: FeatureGateProps) {
    const hasFeature = useFeature(feature);
    const { planTier, isLoading } = usePermissions();

    // Show children while loading to prevent layout shift
    if (isLoading) {
        return <>{children}</>;
    }

    if (hasFeature) {
        return <>{children}</>;
    }

    // Custom fallback provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // Overlay mode - show locked content with overlay
    if (overlay) {
        return (
            <div className="relative">
                <div className="opacity-30 pointer-events-none blur-[2px]">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                    <UpgradePrompt
                        feature={feature}
                        message={upgradeMessage}
                        compact
                    />
                </div>
            </div>
        );
    }

    // Default upgrade prompt
    return <UpgradePrompt feature={feature} message={upgradeMessage} />;
}

/**
 * Component to gate content based on plan limits.
 */
export function LimitGate({
    limit,
    currentCount,
    children,
    fallback,
    limitMessage
}: LimitGateProps) {
    const withinLimit = useLimit(limit, currentCount);
    const { limits, isLoading } = usePermissions();

    if (isLoading || withinLimit) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    const maxValue = limits[limit];
    return (
        <div className="p-6 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/50 text-center">
            <Lock className="mx-auto mb-3 text-amber-500" size={32} />
            <h3 className="font-bold text-lg">Limit Reached</h3>
            <p className="text-sm text-muted-foreground mt-1">
                {limitMessage || `You've reached your plan limit of ${maxValue} ${limit}.`}
            </p>
            <Link href="/dashboard/settings/billing">
                <Button className="mt-4" size="sm">
                    <Sparkles className="mr-2" size={16} />
                    Upgrade Plan
                </Button>
            </Link>
        </div>
    );
}

interface UpgradePromptProps {
    feature: string;
    message?: string;
    compact?: boolean;
}

function UpgradePrompt({ feature, message, compact = false }: UpgradePromptProps) {
    const featureLabels: Record<string, string> = {
        heatmaps: "Performance Heatmaps",
        rbac: "Team Roles & Permissions",
        promotions_engine: "Promotions Engine",
        receipt_builder: "Receipt Builder",
        pdf_csv_reports: "PDF/CSV Reports",
        realtime_collab: "Real-time Collaboration",
        audit_logs: "Audit Logs",
        customer_reviews: "Customer Reviews",
    };

    const label = featureLabels[feature] || feature;

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4"
            >
                <Lock className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="font-bold text-sm">{label}</p>
                <Link href="/dashboard/settings/billing">
                    <Button size="sm" className="mt-2">
                        Upgrade
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-2 border-dashed border-muted rounded-2xl bg-muted/20 text-center"
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white" size={28} />
            </div>
            <h3 className="font-black text-xl">{label}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                {message || `Upgrade your plan to unlock ${label.toLowerCase()} and grow your business.`}
            </p>
            <Link href="/dashboard/settings/billing">
                <Button className="mt-6 font-bold" size="lg">
                    <Sparkles className="mr-2" size={18} />
                    Upgrade Plan
                    <ArrowRight className="ml-2" size={18} />
                </Button>
            </Link>
        </motion.div>
    );
}

/**
 * HOC to wrap components with feature gating.
 */
export function withFeatureGate<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    featureName: string
) {
    return function FeatureGatedComponent(props: P) {
        return (
            <FeatureGate feature={featureName}>
                <WrappedComponent {...props} />
            </FeatureGate>
        );
    };
}
