"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    Menu,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
        { href: "/dashboard/products", label: "Products", icon: <Package size={20} /> },
        { href: "/dashboard/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
        { href: "/dashboard/settings", label: "Settings", icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
                <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                    <img src="/bouteek-logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
                    <h1 className="font-bold text-xl">Merchant</h1>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-[#00D632]/10 text-[#006b19] font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} className="mr-2" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/bouteek-logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
                        <span className="font-bold">Bouteek</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </Button>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
