"use client";

import { ContactBlockSettings } from "@/lib/blocks/types";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    settings: ContactBlockSettings;
}

export function ContactBlock({ settings }: Props) {
    const { whatsapp, phone, email, showFloatingButton } = settings;

    const hasContact = whatsapp || phone || email;

    if (!hasContact) {
        return null;
    }

    const whatsappLink = whatsapp
        ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
        : null;

    return (
        <>
            {/* Contact Section */}
            <section className="py-12 px-6 bg-gray-50">
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <h2 className="text-2xl font-black">Get in Touch</h2>

                    <div className="flex flex-wrap justify-center gap-4">
                        {whatsappLink && (
                            <Button
                                asChild
                                className="rounded-full bg-green-500 hover:bg-green-600 gap-2"
                            >
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp
                                </a>
                            </Button>
                        )}

                        {phone && (
                            <Button asChild variant="outline" className="rounded-full gap-2">
                                <a href={`tel:${phone}`}>
                                    <Phone className="w-5 h-5" />
                                    Call Us
                                </a>
                            </Button>
                        )}

                        {email && (
                            <Button asChild variant="outline" className="rounded-full gap-2">
                                <a href={`mailto:${email}`}>
                                    <Mail className="w-5 h-5" />
                                    Email
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Floating WhatsApp Button */}
            {showFloatingButton && whatsappLink && (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
                    aria-label="WhatsApp"
                >
                    <MessageCircle className="w-7 h-7 text-white" />
                </a>
            )}
        </>
    );
}
