"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    section?: string; // Which section they're currently editing
    cursor?: { x: number; y: number };
    lastActive: number;
}

interface PresenceState {
    isConnected: boolean;
    activeUsers: PresenceUser[];
    currentUser: PresenceUser | null;
    updatePresence: (data: Partial<PresenceUser>) => void;
    setEditingSection: (sectionId: string | null) => void;
    isUserEditing: (sectionId: string) => PresenceUser | null;
}

/**
 * Hook for real-time presence tracking in collaborative editing.
 * Uses Supabase Realtime Presence to show who's currently editing.
 * 
 * @param channelName - Unique channel name for the editing session (e.g., `store-builder-${merchantId}`)
 */
export function useRealtimePresence(channelName: string): PresenceState {
    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
    const [currentUser, setCurrentUser] = useState<PresenceUser | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Initialize presence channel
    useEffect(() => {
        const initPresence = async () => {
            // Get current user info
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user profile for name/avatar
            const { data: userProfile } = await supabase
                .from("users")
                .select("name, email")
                .eq("authId", user.id)
                .single();

            const presenceUser: PresenceUser = {
                id: user.id,
                email: userProfile?.email || user.email || "",
                name: userProfile?.name || user.email?.split("@")[0] || "User",
                section: null,
                lastActive: Date.now(),
            };

            setCurrentUser(presenceUser);

            // Create presence channel
            const channel = supabase.channel(channelName, {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on("presence", { event: "sync" }, () => {
                    const state = channel.presenceState();
                    const users: PresenceUser[] = [];

                    Object.values(state).forEach((presences: any[]) => {
                        presences.forEach((presence) => {
                            if (presence.id !== user.id) {
                                users.push(presence as PresenceUser);
                            }
                        });
                    });

                    setActiveUsers(users);
                })
                .on("presence", { event: "join" }, ({ key, newPresences }) => {
                    console.log("User joined:", key, newPresences);
                })
                .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
                    console.log("User left:", key, leftPresences);
                })
                .subscribe(async (status) => {
                    if (status === "SUBSCRIBED") {
                        setIsConnected(true);
                        // Track own presence
                        await channel.track(presenceUser);
                    }
                });

            channelRef.current = channel;
        };

        initPresence();

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
            setIsConnected(false);
        };
    }, [channelName]);

    // Update presence data
    const updatePresence = useCallback(async (data: Partial<PresenceUser>) => {
        if (!channelRef.current || !currentUser) return;

        const updated = {
            ...currentUser,
            ...data,
            lastActive: Date.now(),
        };

        setCurrentUser(updated);
        await channelRef.current.track(updated);
    }, [currentUser]);

    // Set which section the user is editing
    const setEditingSection = useCallback((sectionId: string | null) => {
        updatePresence({ section: sectionId });
    }, [updatePresence]);

    // Check if another user is editing a specific section
    const isUserEditing = useCallback((sectionId: string): PresenceUser | null => {
        return activeUsers.find(user => user.section === sectionId) || null;
    }, [activeUsers]);

    return {
        isConnected,
        activeUsers,
        currentUser,
        updatePresence,
        setEditingSection,
        isUserEditing,
    };
}
