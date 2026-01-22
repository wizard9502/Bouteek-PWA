"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <TranslationProvider>
            <div className="min-h-screen bg-[#050505] text-white selection:bg-bouteek-green selection:text-black">
                <AdminSidebar />

                {/* Main Content */}
                <main className="md:pl-72 min-h-screen transition-all duration-500 ease-in-out relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bouteek-green/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="p-4 md:p-10"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </TranslationProvider>
    );
}
