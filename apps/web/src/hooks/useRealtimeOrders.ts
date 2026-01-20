"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOrdersOptions {
    merchantId: number | null;
    onNewOrder?: (order: any) => void;
    onOrderUpdate?: (order: any) => void;
    playSound?: boolean;
}

// Notification sound as a data URL (short beep)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1dZ4CBhYyPjpKQjYqGhIJ/fXt6en1/goaIioqMi4qJiIaFg4F/fXt6eHl6fH6Ag4aIioqLi4qJiIaFg4F/fXt6eHl6fH6Ag4aIioqLi4qJiIaFg4F/fXt6eHl6fH6Ag4aIioqLi4qJiIaFg4F/fXt6eHl6fH6Ag4aIioqL";

/**
 * Hook for subscribing to real-time order updates via Supabase Realtime.
 * Plays a notification sound when new orders arrive.
 */
export function useRealtimeOrders({
    merchantId,
    onNewOrder,
    onOrderUpdate,
    playSound = true,
}: UseRealtimeOrdersOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== "undefined" && playSound) {
            audioRef.current = new Audio(NOTIFICATION_SOUND);
        }
    }, [playSound]);

    const playNotificationSound = useCallback(() => {
        if (audioRef.current && playSound) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                // Autoplay may be blocked, ignore silently
            });
        }
    }, [playSound]);

    useEffect(() => {
        if (!merchantId) return;

        // Subscribe to orders table for this merchant
        const channel = supabase
            .channel(`orders-${merchantId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                    filter: `merchant_id=eq.${merchantId}`,
                },
                (payload) => {
                    console.log("New order received:", payload.new);
                    playNotificationSound();
                    onNewOrder?.(payload.new);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `merchant_id=eq.${merchantId}`,
                },
                (payload) => {
                    console.log("Order updated:", payload.new);
                    onOrderUpdate?.(payload.new);
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    }, [merchantId, onNewOrder, onOrderUpdate, playNotificationSound]);

    return {
        isConnected: channelRef.current !== null,
    };
}
