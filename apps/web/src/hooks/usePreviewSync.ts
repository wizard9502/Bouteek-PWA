"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Preview sync state
 */
export interface PreviewState {
    blocks: any[];
    theme: any;
    storeId?: string;
    storeName?: string;
    isDirty: boolean;
    lastSavedAt?: Date;
}

/**
 * Message types for iframe communication
 */
type PreviewMessage =
    | { type: 'PREVIEW_UPDATE'; payload: Partial<PreviewState> }
    | { type: 'PREVIEW_INIT'; payload: PreviewState }
    | { type: 'PREVIEW_PING' }
    | { type: 'PREVIEW_PONG' };

interface UsePreviewSyncOptions {
    /** Debounce delay in ms for preview updates */
    debounceMs?: number;
    /** Target origin for iframe communication */
    targetOrigin?: string;
    /** Callback when connection status changes */
    onConnectionChange?: (connected: boolean) => void;
}

/**
 * usePreviewSync - Real-time editor to preview synchronization
 * 
 * This hook manages bidirectional communication between the store builder
 * editor and the preview iframe using postMessage.
 * 
 * @example
 * ```tsx
 * const { updatePreview, isConnected, isDirty } = usePreviewSync({
 *   debounceMs: 300,
 *   onConnectionChange: (connected) => console.log('Preview:', connected)
 * });
 * 
 * // Call when blocks change
 * updatePreview({ blocks: newBlocks });
 * ```
 */
export function usePreviewSync(options: UsePreviewSyncOptions = {}) {
    const {
        debounceMs = 300,
        targetOrigin = '*',
        onConnectionChange,
    } = options;

    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    const [pendingState, setPendingState] = useState<Partial<PreviewState> | null>(null);
    const debouncedState = useDebounce(pendingState, debounceMs);

    // Send message to iframe
    const sendToPreview = useCallback((message: PreviewMessage) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, targetOrigin);
        }
    }, [targetOrigin]);

    // Handle incoming messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Validate origin in production
            if (targetOrigin !== '*' && event.origin !== targetOrigin) {
                return;
            }

            const message = event.data as PreviewMessage;

            switch (message.type) {
                case 'PREVIEW_PONG':
                    setIsConnected(true);
                    onConnectionChange?.(true);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [targetOrigin, onConnectionChange]);

    // Ping iframe periodically to check connection
    useEffect(() => {
        const pingInterval = setInterval(() => {
            sendToPreview({ type: 'PREVIEW_PING' });
        }, 5000);

        // Initial ping
        sendToPreview({ type: 'PREVIEW_PING' });

        return () => clearInterval(pingInterval);
    }, [sendToPreview]);

    // Send debounced updates to preview
    useEffect(() => {
        if (debouncedState) {
            sendToPreview({ type: 'PREVIEW_UPDATE', payload: debouncedState });
        }
    }, [debouncedState, sendToPreview]);

    // Update preview with new state
    const updatePreview = useCallback((state: Partial<PreviewState>) => {
        setPendingState(prev => ({
            ...prev,
            ...state,
            isDirty: true,
        }));
        setIsDirty(true);
    }, []);

    // Initialize preview with full state
    const initPreview = useCallback((state: PreviewState) => {
        sendToPreview({ type: 'PREVIEW_INIT', payload: state });
        setIsDirty(false);
    }, [sendToPreview]);

    // Mark as saved
    const markSaved = useCallback(() => {
        setIsDirty(false);
        setLastSavedAt(new Date());
    }, []);

    // Attach iframe ref
    const setIframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
        iframeRef.current = iframe;
        if (iframe) {
            // Ping when iframe loads
            iframe.addEventListener('load', () => {
                sendToPreview({ type: 'PREVIEW_PING' });
            });
        }
    }, [sendToPreview]);

    return {
        /** Ref setter for the preview iframe */
        setIframeRef,
        /** Whether the preview is connected */
        isConnected,
        /** Whether there are unsaved changes */
        isDirty,
        /** Last saved timestamp */
        lastSavedAt,
        /** Update preview with partial state (debounced) */
        updatePreview,
        /** Initialize preview with full state (immediate) */
        initPreview,
        /** Mark current state as saved */
        markSaved,
        /** Send raw message to preview */
        sendToPreview,
    };
}

/**
 * usePreviewReceiver - For use in the preview iframe
 * 
 * Listens for messages from the parent editor and updates local state
 */
export function usePreviewReceiver(
    onUpdate: (state: Partial<PreviewState>) => void,
    onInit?: (state: PreviewState) => void
) {
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data as PreviewMessage;

            switch (message.type) {
                case 'PREVIEW_UPDATE':
                    onUpdate(message.payload);
                    break;
                case 'PREVIEW_INIT':
                    onInit?.(message.payload);
                    break;
                case 'PREVIEW_PING':
                    // Respond to ping
                    event.source?.postMessage({ type: 'PREVIEW_PONG' }, { targetOrigin: '*' });
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onUpdate, onInit]);
}

export default usePreviewSync;
