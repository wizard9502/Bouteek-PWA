"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Bell,
    Settings,
    CreditCard,
    FileText,
    Shield,
    LogOut,
    Menu,
    X,
    Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubdomain, setIsSubdomain] = useState(false);

    // Detect if we're on admin.bouteek.shop subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bouteek.shop";
            setIsSubdomain(hostname === `admin.${rootDomain}` || hostname.startsWith("admin."));
        }
    }, []);

    // Generate correct href based on subdomain
    const getHref = (path: string) => {
        if (isSubdomain) {
            // On admin.bouteek.shop, remove /admin prefix
            return path === "/admin" ? "/" : path.replace("/admin", "");
        }
        return path;
    };

    // Check if route is active
    const isActive = (href: string) => {
        const normalizedPath = isSubdomain ? `/admin${pathname === "/" ? "" : pathname}` : pathname;
        return normalizedPath === href || (href !== "/admin" && normalizedPath?.startsWith(href));
    };

    const routes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin", color: "text-sky-400" },
        { label: "Users", icon: Users, href: "/admin/users", color: "text-blue-400" },
        { label: "Plans", icon: Layers, href: "/admin/plans", color: "text-emerald-400" },
        { label: "Merchants", icon: Users, href: "/admin/merchants", color: "text-violet-400" },
        { label: "Analytics", icon: BarChart3, href: "/admin/analytics", color: "text-pink-400" },
        { label: "Notifications", icon: Bell, href: "/admin/notifications", color: "text-orange-400" },
        { label: "Payouts", icon: CreditCard, href: "/admin/payouts", color: "text-yellow-400" },
        { label: "Reports", icon: FileText, href: "/admin/reports", color: "text-cyan-400" },
        { label: "Settings", icon: Settings, href: "/admin/settings", color: "text-slate-400" },
        { label: "Audit Logs", icon: Shield, href: "/admin/audit", color: "text-red-400" },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-black/80 backdrop-blur-xl border border-white/10 text-white rounded-full h-12 w-12 shadow-2xl shadow-bouteek-green/20"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <motion.div
                initial={false}
                animate={{ x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? "-100%" : 0) }}
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-[#050505]/90 backdrop-blur-3xl text-white border-r border-white/5 transition-all duration-500 ease-in-out md:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="px-10 py-10">
                        <Link href={getHref("/admin")} className="group flex flex-col items-center gap-4 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-bouteek-green/20 blur-2xl rounded-full group-hover:bg-bouteek-green/40 transition-all duration-500" />
                                <div className="relative w-24 h-24 rounded-[2.5rem] bg-black border border-white/10 flex items-center justify-center p-4 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                                    <img
                                        src="/bouteek-logo.jpg"
                                        alt="Bouteek Logo"
                                        className="w-full h-full object-contain filter contrast-125 brightness-110"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-[0.2em] text-white uppercase italic">Bouteek</h1>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-px w-4 bg-bouteek-green/50" />
                                    <span className="text-[10px] font-black text-bouteek-green uppercase tracking-[0.3em]">Administrator</span>
                                    <div className="h-px w-4 bg-bouteek-green/50" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
                        {routes.map((route, index) => {
                            const active = isActive(route.href);
                            return (
                                <motion.div
                                    key={route.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={getHref(route.href)}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group relative overflow-hidden",
                                            active
                                                ? "bg-gradient-to-r from-bouteek-green/10 to-transparent text-white"
                                                : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        {/* Activity Indicator */}
                                        {active && (
                                            <motion.div
                                                layoutId="active-nav-indicator"
                                                className="absolute left-0 w-1 h-8 bg-bouteek-green rounded-full shadow-[0_0_15px_rgba(0,255,65,0.8)]"
                                            />
                                        )}

                                        <route.icon className={cn(
                                            "w-5 h-5 transition-all duration-300",
                                            active ? "text-bouteek-green scale-110 drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]" : "group-hover:text-white"
                                        )} />

                                        <span className={cn(
                                            "font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300",
                                            active ? "translate-x-1" : "group-hover:translate-x-1"
                                        )}>
                                            {route.label}
                                        </span>

                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Footer - Floating Logout */}
                    <div className="p-8">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center justify-between gap-4 px-8 py-5 w-full rounded-[2rem] bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-all duration-500"
                        >
                            <div className="flex items-center gap-4">
                                <LogOut size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                                <span className="font-black text-[11px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-white">Exit Console</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-red-500/50 group-hover:bg-red-500 animate-pulse" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Sidebar Overlay (Mobile) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
