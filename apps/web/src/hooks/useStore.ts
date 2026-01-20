"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SectionConfig, ModuleType } from '@/lib/store-builder/component-registry';
import { SocialLinks, ThemeSettings } from '@/lib/store-builder/section-schemas';
import { TEMPLATE_PRESETS, TemplatePreset } from '@/lib/store-builder/template-presets';
import { toast } from 'sonner';

export interface StoreLayout {
    sections: SectionConfig[];
}

export interface StoreData {
    id: string;
    merchantId: number;
    templateId: string;
    moduleType: ModuleType;
    layout: StoreLayout;
    socialLinks: SocialLinks;
    themeConfig: ThemeSettings;
}

interface UseStoreOptions {
    enableRealtime?: boolean;
}

/**
 * useStore - Fetch and manage storefront layout with optional realtime subscription
 */
export function useStore(options: UseStoreOptions = {}) {
    const { enableRealtime = false } = options;

    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [merchantId, setMerchantId] = useState<number | null>(null);

    // Fetch store data
    const fetchStore = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Not authenticated');
                return;
            }

            // Get merchant
            const { data: merchant, error: merchantError } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (merchantError || !merchant) {
                setError('Merchant not found');
                return;
            }

            setMerchantId(merchant.id);

            // Get storefront
            const { data: storefront, error: storefrontError } = await supabase
                .from('storefronts')
                .select('*')
                .eq('merchant_id', merchant.id)
                .single();

            if (storefrontError && storefrontError.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine for new stores
                throw storefrontError;
            }

            if (storefront) {
                // Parse layout - handle both string and object
                let layout: StoreLayout = { sections: [] };
                if (storefront.layout) {
                    layout = typeof storefront.layout === 'string'
                        ? JSON.parse(storefront.layout)
                        : storefront.layout;
                }

                // Parse social links
                let socialLinks: SocialLinks = { instagram: '', snapchat: '', tiktok: '' };
                if (storefront.social_links) {
                    socialLinks = typeof storefront.social_links === 'string'
                        ? JSON.parse(storefront.social_links)
                        : storefront.social_links;
                }

                // Parse theme config
                let themeConfig: ThemeSettings = {
                    primaryColor: '#000000',
                    secondaryColor: '#ffffff',
                    accentColor: '#00FF41',
                    fontFamily: 'Inter',
                    borderRadius: 'lg',
                };
                if (storefront.theme_config) {
                    const parsed = typeof storefront.theme_config === 'string'
                        ? JSON.parse(storefront.theme_config)
                        : storefront.theme_config;
                    themeConfig = { ...themeConfig, ...parsed };
                }

                setStore({
                    id: storefront.id,
                    merchantId: merchant.id,
                    templateId: storefront.template_id || 'minimalist_fashion',
                    moduleType: storefront.module_type || 'sale',
                    layout,
                    socialLinks,
                    themeConfig,
                });
            } else {
                // Create default store from template
                const defaultTemplate = TEMPLATE_PRESETS[0];
                setStore({
                    id: '',
                    merchantId: merchant.id,
                    templateId: defaultTemplate.id,
                    moduleType: defaultTemplate.module,
                    layout: defaultTemplate.layout,
                    socialLinks: defaultTemplate.socialLinks,
                    themeConfig: defaultTemplate.theme,
                });
            }
        } catch (err) {
            console.error('Error fetching store:', err);
            setError('Failed to load store data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save store data
    const saveStore = useCallback(async (data: Partial<StoreData>) => {
        if (!merchantId) return false;

        try {
            setIsSaving(true);

            const updateData = {
                merchant_id: merchantId,
                template_id: data.templateId || store?.templateId,
                module_type: data.moduleType || store?.moduleType,
                layout: data.layout || store?.layout,
                social_links: data.socialLinks || store?.socialLinks,
                theme_config: data.themeConfig || store?.themeConfig,
                updated_at: new Date().toISOString(),
            };

            const { error: upsertError } = await supabase
                .from('storefronts')
                .upsert(updateData, { onConflict: 'merchant_id' });

            if (upsertError) throw upsertError;

            // Update local state
            setStore(prev => prev ? { ...prev, ...data } : null);

            // Haptic feedback on save (PWA)
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }

            toast.success('Store saved successfully!');
            return true;
        } catch (err) {
            console.error('Error saving store:', err);
            toast.error('Failed to save store');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [merchantId, store]);

    // Apply template
    const applyTemplate = useCallback((templateId: string) => {
        const template = TEMPLATE_PRESETS.find(t => t.id === templateId);
        if (!template) return;

        setStore(prev => prev ? {
            ...prev,
            templateId: template.id,
            moduleType: template.module,
            layout: template.layout,
            themeConfig: template.theme,
        } : null);

        toast.success(`Template "${template.name}" applied!`);
    }, []);

    // Update section config
    const updateSection = useCallback((sectionId: string, config: Record<string, any>) => {
        setStore(prev => {
            if (!prev) return null;

            const newSections = prev.layout.sections.map(s =>
                s.id === sectionId ? { ...s, config: { ...s.config, ...config } } : s
            );

            return {
                ...prev,
                layout: { sections: newSections },
            };
        });
    }, []);

    // Add section
    const addSection = useCallback((section: SectionConfig) => {
        setStore(prev => {
            if (!prev) return null;
            return {
                ...prev,
                layout: {
                    sections: [...prev.layout.sections, section],
                },
            };
        });
    }, []);

    // Remove section
    const removeSection = useCallback((sectionId: string) => {
        setStore(prev => {
            if (!prev) return null;
            return {
                ...prev,
                layout: {
                    sections: prev.layout.sections.filter(s => s.id !== sectionId),
                },
            };
        });
    }, []);

    // Reorder sections
    const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
        setStore(prev => {
            if (!prev) return null;

            const newSections = [...prev.layout.sections];
            const [removed] = newSections.splice(fromIndex, 1);
            newSections.splice(toIndex, 0, removed);

            return {
                ...prev,
                layout: { sections: newSections },
            };
        });
    }, []);

    // Update social links
    const updateSocialLinks = useCallback((links: Partial<SocialLinks>) => {
        setStore(prev => {
            if (!prev) return null;
            return {
                ...prev,
                socialLinks: { ...prev.socialLinks, ...links },
            };
        });
    }, []);

    // Update theme
    const updateTheme = useCallback((theme: Partial<ThemeSettings>) => {
        setStore(prev => {
            if (!prev) return null;
            return {
                ...prev,
                themeConfig: { ...prev.themeConfig, ...theme },
            };
        });
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchStore();
    }, [fetchStore]);

    // Realtime subscription
    useEffect(() => {
        if (!enableRealtime || !merchantId) return;

        const channel = supabase
            .channel('storefront-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'storefronts',
                    filter: `merchant_id=eq.${merchantId}`,
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchStore();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [enableRealtime, merchantId, fetchStore]);

    return {
        store,
        isLoading,
        isSaving,
        error,
        saveStore,
        applyTemplate,
        updateSection,
        addSection,
        removeSection,
        reorderSections,
        updateSocialLinks,
        updateTheme,
        refetch: fetchStore,
    };
}

export default useStore;
