"use client";

import { usePermissions } from "./usePermissions";

/**
 * Simple hook to check if a specific feature is enabled for the current merchant.
 * Returns a boolean indicating feature availability.
 * 
 * @param featureName - The feature key to check (e.g., 'heatmaps', 'rbac', 'promotions_engine')
 * @returns boolean - Whether the feature is enabled
 * 
 * @example
 * const hasHeatmaps = useFeature('heatmaps');
 * if (hasHeatmaps) {
 *   // Show heatmap UI
 * }
 */
export function useFeature(featureName: string): boolean {
    const { can, isLoading } = usePermissions();

    // While loading, assume feature is disabled to prevent flash of content
    if (isLoading) {
        return false;
    }

    return can(featureName);
}

/**
 * Hook to check if current usage is within plan limits.
 * 
 * @param limitName - The limit key to check (e.g., 'products', 'staff', 'modules')
 * @param currentCount - The current usage count
 * @returns boolean - Whether within limit
 * 
 * @example
 * const canAddProduct = useLimit('products', productCount);
 * if (!canAddProduct) {
 *   // Show upgrade prompt
 * }
 */
export function useLimit(limitName: string, currentCount: number): boolean {
    const { hasLimit, isLoading } = usePermissions();

    if (isLoading) {
        return true; // Allow during loading to prevent blocking
    }

    return hasLimit(limitName, currentCount);
}
