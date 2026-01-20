"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ListingEditorState } from './useListingEditor';
import { ModuleType, getDefaultMetadata } from '@/lib/listing-schemas';

const STORAGE_KEY = 'bouteek_listing_draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

interface DraftData {
    state: ListingEditorState;
    savedAt: string;
}

interface UseOfflineDraftOptions {
    enabled?: boolean;
    onDraftRestored?: (draft: ListingEditorState) => void;
}

export function useOfflineDraft(
    state: ListingEditorState,
    options: UseOfflineDraftOptions = {}
) {
    const { enabled = true, onDraftRestored } = options;

    const [hasDraft, setHasDraft] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const stateRef = useRef(state);
    stateRef.current = state;

    // Check for existing draft on mount
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const draft: DraftData = JSON.parse(stored);
                setHasDraft(true);
                setLastSavedAt(new Date(draft.savedAt));
            } catch (e) {
                // Invalid stored data, clear it
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, [enabled]);

    // Auto-save draft every 5 seconds when state changes
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        const interval = setInterval(() => {
            saveDraft(stateRef.current);
        }, AUTO_SAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [enabled]);

    // Save draft to localStorage
    const saveDraft = useCallback((stateToSave: ListingEditorState) => {
        if (typeof window === 'undefined') return;

        // Only save if there's meaningful content
        if (!stateToSave.title && stateToSave.media_urls.length === 0) {
            return;
        }

        const draftData: DraftData = {
            state: stateToSave,
            savedAt: new Date().toISOString(),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
            setHasDraft(true);
            setLastSavedAt(new Date(draftData.savedAt));
        } catch (e) {
            console.warn('Failed to save draft to localStorage:', e);
        }
    }, []);

    // Restore draft from localStorage
    const restoreDraft = useCallback((): ListingEditorState | null => {
        if (typeof window === 'undefined') return null;

        setIsRestoring(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const draft: DraftData = JSON.parse(stored);

            // Validate that the module type is valid
            const validModuleTypes: ModuleType[] = ['sale', 'rental', 'service'];
            if (!validModuleTypes.includes(draft.state.module_type)) {
                draft.state.module_type = 'sale';
                draft.state.metadata = getDefaultMetadata('sale');
            }

            onDraftRestored?.(draft.state);
            return draft.state;
        } catch (e) {
            console.warn('Failed to restore draft:', e);
            return null;
        } finally {
            setIsRestoring(false);
        }
    }, [onDraftRestored]);

    // Clear draft from localStorage
    const clearDraft = useCallback(() => {
        if (typeof window === 'undefined') return;

        localStorage.removeItem(STORAGE_KEY);
        setHasDraft(false);
        setLastSavedAt(null);
    }, []);

    // Get draft info without restoring
    const getDraftInfo = useCallback((): { exists: boolean; savedAt: Date | null; moduleType?: ModuleType } => {
        if (typeof window === 'undefined') {
            return { exists: false, savedAt: null };
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return { exists: false, savedAt: null };

            const draft: DraftData = JSON.parse(stored);
            return {
                exists: true,
                savedAt: new Date(draft.savedAt),
                moduleType: draft.state.module_type,
            };
        } catch (e) {
            return { exists: false, savedAt: null };
        }
    }, []);

    // Format saved time for display
    const formatSavedTime = useCallback(() => {
        if (!lastSavedAt) return null;

        const now = new Date();
        const diffMs = now.getTime() - lastSavedAt.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);

        if (diffSeconds < 60) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} min ago`;
        } else {
            return lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }, [lastSavedAt]);

    return {
        // State
        hasDraft,
        lastSavedAt,
        isRestoring,

        // Actions
        saveDraft,
        restoreDraft,
        clearDraft,

        // Helpers
        getDraftInfo,
        formatSavedTime,
    };
}
