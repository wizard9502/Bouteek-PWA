"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function NotificationsManager() {
    useEffect(() => {
        // 1. Request Permission
        if ("Notification" in window) {
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        }

        // 2. Subscribe to Orders
        const channel = supabase
            .channel('realtime:orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    handleNewOrder(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewOrder = (order: any) => {
        const message = `New Order #${order.id.slice(0, 8)} received!`;
        const amount = `${Number(order.total_amount).toLocaleString()} XOF`;

        // 1. Toast
        toast.info(message, {
            description: `Amount: ${amount}`,
            duration: 5000,
            icon: <Bell size={16} />
        });

        // 2. System Notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Order Received", {
                body: `${message} - ${amount}`,
                icon: "/bouteek-logo.jpg"
            });
        }
    };

    return null;
}
