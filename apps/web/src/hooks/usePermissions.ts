"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PlanFeatures {
    max_modules: number;
    basic_stats: boolean;
    standard_seo: boolean;
    customer_reviews: boolean;
    pdf_csv_reports: boolean;
    team_seats: number;
    rbac: boolean;
    promotions_engine: boolean;
    receipt_builder: boolean;
    heatmaps: boolean;
    audit_logs: boolean;
    realtime_collab: boolean;
    [key: string]: boolean | number;
}

interface PlanLimits {
    products: number;
    staff: number;
    modules: number;
    [key: string]: number;
}

interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    features: PlanFeatures;
    limits: PlanLimits;
}

interface Subscription {
    id: string;
    plan_id: string;
    status: string;
    current_period_end: string;
    plan: Plan;
}

interface PermissionsState {
    isLoading: boolean;
    subscription: Subscription | null;
    plan: Plan | null;
    planTier: string;
    features: PlanFeatures;
    limits: PlanLimits;
    can: (feature: string) => boolean;
    hasLimit: (limit: string, currentCount: number) => boolean;
    isActive: boolean;
    daysRemaining: number;
    error: Error | null;
    refetch: () => Promise<void>;
}

const defaultFeatures: PlanFeatures = {
    max_modules: 1,
    basic_stats: true,
    standard_seo: true,
    customer_reviews: false,
    pdf_csv_reports: false,
    team_seats: 0,
    rbac: false,
    promotions_engine: false,
    receipt_builder: false,
    heatmaps: false,
    audit_logs: false,
    realtime_collab: false,
};

const defaultLimits: PlanLimits = {
    products: 10,
    staff: 1,
    modules: 1,
};

/**
 * Hook to get merchant's current plan permissions and feature access.
 * Queries the subscriptions and plans tables to determine what features are available.
 */
export function usePermissions(): PermissionsState {
    const [isLoading, setIsLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetchPermissions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            // Get merchant ID
            const { data: merchant } = await supabase
                .from("merchants")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!merchant) {
                setIsLoading(false);
                return;
            }

            // Get subscription with plan details
            const { data: subscriptionData, error: subError } = await supabase
                .from("subscriptions")
                .select(`
                    id,
                    plan_id,
                    status,
                    current_period_end,
                    plan:plans (
                        id,
                        name,
                        slug,
                        price,
                        features,
                        limits
                    )
                `)
                .eq("merchant_id", merchant.id)
                .eq("status", "active")
                .single();

            if (subError && subError.code !== "PGRST116") {
                throw subError;
            }

            setSubscription(subscriptionData as unknown as Subscription);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError(err instanceof Error ? err : new Error("Failed to fetch permissions"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Derive plan details
    const plan = subscription?.plan || null;
    const planTier = plan?.slug || "free";
    const features: PlanFeatures = plan?.features || defaultFeatures;
    const limits: PlanLimits = plan?.limits || defaultLimits;

    // Check if subscription is active and not expired
    const isActive = subscription?.status === "active" &&
        (!subscription.current_period_end ||
            new Date(subscription.current_period_end) > new Date());

    // Calculate days remaining
    const daysRemaining = subscription?.current_period_end
        ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    /**
     * Check if a feature is enabled for the current plan.
     * Features with boolean values return true/false.
     * Features with numeric values (like team_seats) return true if > 0 or -1 (unlimited).
     */
    const can = useCallback((feature: string): boolean => {
        if (!isActive && planTier !== "free") {
            return false; // Expired subscription
        }

        const value = features[feature];
        if (typeof value === "boolean") {
            return value;
        }
        if (typeof value === "number") {
            return value === -1 || value > 0; // -1 means unlimited
        }
        return false;
    }, [features, isActive, planTier]);

    /**
     * Check if the current usage is within the plan limit.
     * Returns true if within limit, false if exceeded.
     * -1 in limits means unlimited.
     */
    const hasLimit = useCallback((limit: string, currentCount: number): boolean => {
        const maxValue = limits[limit];
        if (maxValue === undefined) return true;
        if (maxValue === -1) return true; // Unlimited
        return currentCount < maxValue;
    }, [limits]);

    return {
        isLoading,
        subscription,
        plan,
        planTier,
        features,
        limits,
        can,
        hasLimit,
        isActive,
        daysRemaining,
        error,
        refetch: fetchPermissions,
    };
}
