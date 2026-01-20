"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
    ModuleType,
    Listing,
    SaleMetadata,
    RentalMetadata,
    ServiceMetadata,
    getDefaultMetadata,
    saleListingSchema,
    rentalListingSchema,
    serviceListingSchema,
} from '@/lib/listing-schemas';

export interface ListingEditorState {
    id?: string;
    store_id?: string;
    module_type: ModuleType;
    title: string;
    description: string;
    base_price: number;
    video_url: string;
    media_urls: string[];
    category: string;
    is_active: boolean;
    is_featured: boolean;
    metadata: SaleMetadata | RentalMetadata | ServiceMetadata;
}

interface ValidationError {
    path: string[];
    message: string;
}

interface UseListingEditorOptions {
    listingId?: string;
    onSaveSuccess?: (listing: ListingEditorState) => void;
    onSaveError?: (error: Error) => void;
}

const getInitialState = (moduleType: ModuleType): ListingEditorState => ({
    module_type: moduleType,
    title: '',
    description: '',
    base_price: 0,
    video_url: '',
    media_urls: [],
    category: '',
    is_active: true,
    is_featured: false,
    metadata: getDefaultMetadata(moduleType),
});

export function useListingEditor(options: UseListingEditorOptions = {}) {
    const { listingId, onSaveSuccess, onSaveError } = options;

    const [state, setState] = useState<ListingEditorState>(getInitialState('sale'));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Load existing listing if editing
    useEffect(() => {
        if (listingId) {
            loadListing(listingId);
        }
    }, [listingId]);

    const loadListing = async (id: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setState({
                    id: data.id,
                    store_id: data.store_id,
                    module_type: data.module_type,
                    title: data.title || '',
                    description: data.description || '',
                    base_price: data.base_price || 0,
                    video_url: data.video_url || '',
                    media_urls: data.media_urls || [],
                    category: data.category || '',
                    is_active: data.is_active ?? true,
                    is_featured: data.is_featured ?? false,
                    metadata: data.metadata || getDefaultMetadata(data.module_type),
                });
            }
        } catch (error) {
            console.error('Failed to load listing:', error);
            toast.error('Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    // Change module type with metadata reset
    const setModuleType = useCallback((moduleType: ModuleType) => {
        setState(prev => ({
            ...prev,
            module_type: moduleType,
            metadata: getDefaultMetadata(moduleType),
        }));
        setIsDirty(true);
    }, []);

    // Update a single field
    const updateField = useCallback(<K extends keyof ListingEditorState>(
        field: K,
        value: ListingEditorState[K]
    ) => {
        setState(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    // Update metadata field
    const updateMetadata = useCallback(<K extends keyof (SaleMetadata & RentalMetadata & ServiceMetadata)>(
        field: K,
        value: any
    ) => {
        setState(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value },
        }));
        setIsDirty(true);
    }, []);

    // Add media URL
    const addMediaUrl = useCallback((url: string) => {
        setState(prev => ({
            ...prev,
            media_urls: [...prev.media_urls, url],
        }));
        setIsDirty(true);
    }, []);

    // Remove media URL
    const removeMediaUrl = useCallback((index: number) => {
        setState(prev => ({
            ...prev,
            media_urls: prev.media_urls.filter((_, i) => i !== index),
        }));
        setIsDirty(true);
    }, []);

    // Reorder media URLs
    const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
        setState(prev => {
            const newUrls = [...prev.media_urls];
            const [removed] = newUrls.splice(fromIndex, 1);
            newUrls.splice(toIndex, 0, removed);
            return { ...prev, media_urls: newUrls };
        });
        setIsDirty(true);
    }, []);

    // Validate the current state
    const validate = useCallback(() => {
        const schemaMap = {
            sale: saleListingSchema,
            rental: rentalListingSchema,
            service: serviceListingSchema,
        };

        const schema = schemaMap[state.module_type];
        const result = schema.safeParse(state);

        if (!result.success) {
            const validationErrors: ValidationError[] = result.error.issues.map(err => ({
                path: err.path.map(String),
                message: err.message,
            }));
            setErrors(validationErrors);
            return false;
        }

        setErrors([]);
        return true;
    }, [state]);

    // Get error for a specific field
    const getFieldError = useCallback((fieldPath: string) => {
        return errors.find(e => e.path.join('.') === fieldPath)?.message;
    }, [errors]);

    // Save listing
    const save = useCallback(async () => {
        if (!validate()) {
            toast.error('Please fix validation errors');
            return false;
        }

        setSaving(true);
        try {
            // Get current user's merchant
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: merchant } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!merchant) throw new Error('Merchant profile not found');

            const listingData = {
                store_id: merchant.id,
                module_type: state.module_type,
                title: state.title,
                description: state.description || null,
                base_price: state.base_price,
                video_url: state.video_url || null,
                media_urls: state.media_urls,
                category: state.category || null,
                is_active: state.is_active,
                is_featured: state.is_featured,
                metadata: state.metadata,
            };

            let result;
            if (state.id) {
                // Update existing
                result = await supabase
                    .from('listings')
                    .update(listingData)
                    .eq('id', state.id)
                    .select()
                    .single();
            } else {
                // Create new
                result = await supabase
                    .from('listings')
                    .insert(listingData)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            // Haptic feedback on mobile
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(50);
            }

            toast.success(state.id ? 'Listing updated!' : 'Listing published!');
            setIsDirty(false);

            if (result.data) {
                setState(prev => ({ ...prev, id: result.data.id, store_id: result.data.store_id }));
            }

            onSaveSuccess?.(state);
            return true;
        } catch (error) {
            console.error('Failed to save listing:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save listing';
            toast.error(errorMessage);
            onSaveError?.(error instanceof Error ? error : new Error(errorMessage));
            return false;
        } finally {
            setSaving(false);
        }
    }, [state, validate, onSaveSuccess, onSaveError]);

    // Step navigation
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, totalSteps]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step);
        }
    }, [totalSteps]);

    // Reset to initial state
    const reset = useCallback((moduleType?: ModuleType) => {
        setState(getInitialState(moduleType || 'sale'));
        setErrors([]);
        setIsDirty(false);
        setCurrentStep(1);
    }, []);

    // Check if step is valid for navigation
    const isStepValid = useMemo(() => {
        switch (currentStep) {
            case 1:
                return !!state.module_type;
            case 2:
                return state.media_urls.length > 0 || !!state.video_url;
            case 3:
                return !!state.title && state.base_price > 0;
            case 4:
                return true; // Preview step
            default:
                return false;
        }
    }, [currentStep, state]);

    return {
        // State
        state,
        loading,
        saving,
        errors,
        isDirty,
        currentStep,
        totalSteps,
        isStepValid,

        // Module type
        setModuleType,

        // Field updates
        updateField,
        updateMetadata,

        // Media management
        addMediaUrl,
        removeMediaUrl,
        reorderMedia,

        // Validation
        validate,
        getFieldError,

        // Actions
        save,
        reset,
        loadListing,

        // Navigation
        nextStep,
        prevStep,
        goToStep,
    };
}
