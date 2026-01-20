"use client";

import { useCallback } from "react";

interface CustomerInfo {
    name: string;
    phone: string;
}

interface ContactOptions {
    orderId: string;
    storeName: string;
}

/**
 * Hook for contacting customers via native device capabilities.
 * Provides Call, SMS, and WhatsApp triggers with pre-filled templates.
 */
export function useContactCustomer(customer: CustomerInfo, options: ContactOptions) {
    const { name, phone } = customer;
    const { orderId, storeName } = options;

    // Clean phone number for use in URLs
    const cleanPhone = phone.replace(/\D/g, "");

    /**
     * Trigger a phone call using the tel: protocol
     */
    const call = useCallback(() => {
        if (!phone) {
            console.warn("No phone number available");
            return;
        }
        window.location.href = `tel:${cleanPhone}`;
    }, [cleanPhone, phone]);

    /**
     * Trigger SMS with pre-filled template
     */
    const sendSms = useCallback(() => {
        if (!phone) {
            console.warn("No phone number available");
            return;
        }

        const message = `Hello ${name}, I am contacting you regarding your Bouteek order #${orderId.slice(0, 8)}.`;
        const encodedMessage = encodeURIComponent(message);

        // Use sms: protocol - works on iOS and Android
        window.location.href = `sms:${cleanPhone}?body=${encodedMessage}`;
    }, [cleanPhone, phone, name, orderId]);

    /**
     * Open WhatsApp with pre-filled message
     */
    const sendWhatsApp = useCallback(() => {
        if (!phone) {
            console.warn("No phone number available");
            return;
        }

        const message = `Hello ${name}, this is ${storeName}. We've received your order #${orderId.slice(0, 8)} and would like to confirm some details.`;
        const encodedMessage = encodeURIComponent(message);

        // WhatsApp API for deep linking
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
    }, [cleanPhone, phone, name, orderId, storeName]);

    /**
     * Copy phone number to clipboard
     */
    const copyPhone = useCallback(async () => {
        if (!phone) return;
        try {
            await navigator.clipboard.writeText(phone);
            return true;
        } catch {
            return false;
        }
    }, [phone]);

    return {
        call,
        sendSms,
        sendWhatsApp,
        copyPhone,
        hasPhone: Boolean(phone),
    };
}
