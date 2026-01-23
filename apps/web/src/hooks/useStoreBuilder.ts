import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Block } from "@/lib/blocks/types";
import { DEFAULT_LAYOUT } from "@/lib/blocks/defaults";
import { toast } from "sonner";

export interface StoreData {
    id: string; // storefront_id
    merchant_id: string;
    slug: string;
    settings: any; // Store-wide settings (logo, colors, etc.)
    blocks: Block[];
    is_published: boolean;
    published_at: string | null;
}

export function useStoreBuilder() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

    // Fetch initial data
    const fetchStoreData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get merchant ID
            const { data: merchant } = await supabase
                .from("merchants")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!merchant) {
                console.error("Merchant not found");
                return;
            }

            // Get storefront
            const { data: storefront, error } = await supabase
                .from("storefronts")
                .select("*")
                .eq("merchant_id", merchant.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching storefront:", error);
                return;
            }

            if (storefront) {
                setStoreData({
                    id: storefront.id,
                    merchant_id: merchant.id,
                    slug: storefront.slug || "",
                    settings: storefront.settings || {},
                    blocks: storefront.layout_blocks || DEFAULT_LAYOUT,
                    is_published: storefront.is_published,
                    published_at: storefront.published_at
                });
            } else {
                // Determine default slug from business name or random?
                // For now empty.
                setStoreData({
                    id: "", // Will be created on save
                    merchant_id: merchant.id,
                    slug: "",
                    settings: {},
                    blocks: DEFAULT_LAYOUT,
                    is_published: false,
                    published_at: null
                });
            }

        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("Failed to load store data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check slug availability
    const checkSlug = useCallback(async (slug: string) => {
        if (!slug || slug.length < 3) {
            setSlugAvailable(null);
            return;
        }

        // If it's the same as current saved slug, it's valid
        if (storeData?.slug === slug) {
            setSlugAvailable(true);
            return;
        }

        setIsCheckingSlug(true);
        try {
            const { data, error } = await supabase
                .from("storefronts")
                .select("id")
                .eq("slug", slug)
                .maybeSingle(); // Use maybeSingle to avoid error on 0 rows

            if (error) throw error;
            setSlugAvailable(!data); // If data exists, slug is taken
        } catch (error) {
            console.error("Error checking slug:", error);
            setSlugAvailable(false); // Assume unavailable on error safety
        } finally {
            setIsCheckingSlug(false);
        }
    }, [storeData?.slug]);

    // Save Draft
    const saveStore = async (blocks: Block[], settings: any, slug: string) => {
        if (!storeData?.merchant_id) return;
        setIsSaving(true);
        try {
            // Validate slug if changed
            if (slug !== storeData.slug) {
                // If slug is empty, warn? Or allow saving draft without slug?
                // "Input a Slug... Must include a real-time check"
                // Drafts might not need unique slug immediately, but good to enforce.
            }

            const payload = {
                merchant_id: storeData.merchant_id,
                layout_blocks: blocks,
                settings: settings,
                slug: slug || null, // Allow null for drafts if not set
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("storefronts")
                .upsert(payload, { onConflict: "merchant_id" })
                .select()
                .single();

            if (error) throw error;

            setStoreData(prev => prev ? {
                ...prev,
                ...data,
                blocks: data.layout_blocks,
                settings: data.settings,
                slug: data.slug
            } : null);

            toast.success("Changes saved as draft");
            return true;
        } catch (error) {
            console.error("Error saving store:", error);
            toast.error("Failed to save changes");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Publish
    const publishStore = async (blocks: Block[], settings: any, slug: string) => {
        if (!slug) {
            toast.error("You must choose a Store URL (slug) to publish!", {
                duration: 4000,
                // icon: "🛑" // Sonner doesn't support icon prop directly like this usually
            });
            return;
        }

        if (slugAvailable === false) {
            toast.error("This Store URL is already taken. Please choose another.");
            return;
        }

        // First save everything
        const saved = await saveStore(blocks, settings, slug);
        if (!saved) return;

        setIsSaving(true);
        try {
            // Get ID (should be set after save)
            // But we need to ensure we have the ID.
            // If saveStore succeeded, storeData should update? 
            // State updates are async. Better to re-fetch or use return val.
            // Actually fetchStoreData might be needed to get the fresh ID if it was new.

            // Let's get the ID freshly from DB to be safe or rely on what upsert returned if we could.
            const { data: currentStore } = await supabase
                .from("storefronts")
                .select("id")
                .eq("merchant_id", storeData!.merchant_id)
                .single();

            if (!currentStore) throw new Error("Store ID not found");

            // Call RPC
            const { data, error } = await supabase.rpc('publish_storefront', {
                p_storefront_id: currentStore.id
            });

            if (error) throw error;

            setStoreData(prev => prev ? { ...prev, is_published: true, published_at: new Date().toISOString() } : null);

            // Success Modal or Toast handled by UI
            return { success: true, slug: slug };

        } catch (error) {
            console.error("Error publishing:", error);
            toast.error("Failed to publish store");
            return { success: false };
        } finally {
            setIsSaving(false);
        }
    };

    return {
        storeData,
        isLoading,
        isSaving,
        fetchStoreData,
        saveStore,
        publishStore,
        checkSlug,
        slugAvailable,
        isCheckingSlug
    };
}
