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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin", color: "text-sky-500" },
        { label: "Users", icon: Users, href: "/admin/users", color: "text-blue-500" },
        { label: "Plans", icon: Layers, href: "/admin/plans", color: "text-purple-500" },
        { label: "Merchants", icon: Users, href: "/admin/merchants", color: "text-violet-500" },
        { label: "Analytics", icon: BarChart3, href: "/admin/analytics", color: "text-pink-700" },
        { label: "Notifications", icon: Bell, href: "/admin/notifications", color: "text-orange-700" },
        { label: "Payouts", icon: CreditCard, href: "/admin/payouts", color: "text-emerald-500" },
        { label: "Reports", icon: FileText, href: "/admin/reports", color: "text-green-700" },
        { label: "Settings", icon: Settings, href: "/admin/settings", color: "text-gray-500" },
        { label: "Audit Logs", icon: Shield, href: "/admin/audit", color: "text-red-500" },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
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
                    <div className="px-8 py-6 border-b border-gray-800">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                <span className="font-black text-black">B</span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight">Admin</h1>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                    pathname === route.href ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <route.icon className={cn("w-5 h-5 transition-colors", route.color)} />
                                <span className="font-bold text-sm tracking-wide">{route.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800">
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
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
