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
                <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-lg">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="px-8 py-6 border-b border-gray-700">
                        <Link href={getHref("/admin")} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-bouteek-green flex items-center justify-center">
                                <span className="font-black text-black text-lg">B</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-white">Bouteek</h1>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel</span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={getHref(route.href)}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                    isActive(route.href)
                                        ? "bg-bouteek-green text-black font-bold"
                                        : "text-gray-300 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <route.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive(route.href) ? "text-black" : route.color
                                )} />
                                <span className="font-bold text-sm tracking-wide">{route.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-bold text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
