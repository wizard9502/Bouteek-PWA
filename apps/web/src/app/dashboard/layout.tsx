"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Store,
    ShoppingCart,
    Wallet,
    UserCircle,
    Menu,
    LogOut,
    Plus,
    Bell,
    Moon,
    Sun,
    Search,
    Settings,
    Heart
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

import { TawkToChat } from "@/components/TawkToChat";

import { NotificationsManager } from "@/components/NotificationsManager";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <TranslationProvider>
            <NotificationsManager />
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </TranslationProvider>
    );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Fetch User for Chat
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: merchant } = await supabase.from('merchants')
                    .select('id, business_name, preferred_theme')
                    .eq('user_id', user.id).single();

                if (merchant) {
                    setUser({
                        id: merchant.id,
                        name: merchant.business_name || user.email?.split('@')[0],
                        email: user.email
                    });
                    if (merchant.preferred_theme) {
                        setTheme(merchant.preferred_theme);
                    }
                }
            }
        };
        fetchUser();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const navItems = [
        { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
        { href: "/dashboard/store", label: t("sidebar.store"), icon: Store },
        { href: "/dashboard/orders", label: t("sidebar.orders"), icon: ShoppingCart },
        { href: "/dashboard/finance", label: t("sidebar.billing") || "Billing & Subscriptions", icon: Wallet },
        { href: "/dashboard/settings", label: t("sidebar.settings"), icon: Settings },
        { href: "/dashboard/profile", label: t("sidebar.profile"), icon: UserCircle },
    ];



    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden">
            <TawkToChat user={user} />
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300">
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-bouteek-green/10 flex items-center justify-center shadow-lg shadow-bouteek-green/10">
                            <img src="/bouteek-logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl object-contain" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter">Bouteek</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-bouteek-green text-white font-bold shadow-lg shadow-bouteek-green/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={22} className={cn("transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                <span className="text-[11px] uppercase tracking-widest font-bold">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-white/10"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    {/* Theme & Language Switcher Desktop */}
                    <div className="flex flex-wrap gap-2 bg-muted/30 p-3 rounded-[2rem] border border-border/40">
                        {[
                            { id: 'light', color: 'bg-white' },
                            { id: 'dark', color: 'bg-zinc-900' },
                            { id: 'pink', color: 'bg-pink-500' },
                            { id: 'purple', color: 'bg-purple-600' },
                            { id: 'ocean', color: 'bg-blue-500' },
                            { id: 'luxury', color: 'bg-zinc-950', border: 'border-amber-500' },
                            { id: 'sunset', color: 'bg-orange-500' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={async () => {
                                    setTheme(t.id);
                                    if (user?.id) {
                                        await supabase.from('merchants').update({ preferred_theme: t.id }).eq('id', user.id);
                                    }
                                }}
                                className={cn(
                                    "w-6 h-6 rounded-full border transition-all hover:scale-125",
                                    t.color,
                                    t.border || "border-border",
                                    theme === t.id ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-60"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl flex-[2]">
                        <button
                            onClick={() => setLanguage('fr')}
                            className={cn("flex-1 py-1 px-2 rounded-lg text-[10px] font-black transition-all", language === 'fr' ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-muted-foreground")}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={cn("flex-1 py-1 px-2 rounded-lg text-[10px] font-black transition-all", language === 'en' ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-muted-foreground")}
                        >
                            EN
                        </button>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-muted/40 border border-border/50 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bouteek-green/10 flex items-center justify-center text-bouteek-green select-none">
                            <Wallet size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Storage</p>
                            <p className="text-sm font-black">75% Full</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full rounded-2xl border-border/50 hover:bg-red-500 hover:text-white hover:border-red-500 group transition-all"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-wider">{t("sidebar.logout")}</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className={cn(
                "md:hidden fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
                scrolled ? "glass-dark py-3" : "bg-transparent"
            )}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img src="/bouteek-logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-contain" />
                    </div>

                    <span className="font-black text-xl tracking-tighter">Bouteek</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-muted/50"
                        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                    >
                        <span className="text-xs font-black">{language.toUpperCase()}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-muted/50 transition-colors"
                        onClick={async () => {
                            const modes = ['light', 'dark', 'pink', 'purple', 'ocean', 'luxury', 'sunset'];
                            const next = modes[(modes.indexOf(theme || 'light') + 1) % modes.length];
                            setTheme(next);
                            if (user?.id) {
                                await supabase.from('merchants').update({ preferred_theme: next }).eq('id', user.id);
                            }
                        }}
                    >
                        {theme === "dark" || theme === "luxury" ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                        <Bell size={20} />
                    </Button>
                </div>
            </header >

            {/* Main Content Area */}
            < main className="flex-1 flex flex-col min-h-screen relative pb-24 md:pb-0" >
                <div className="flex-1 p-6 md:p-12 mt-16 md:mt-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main >

            {/* Mobile Bottom Navigation */}
            < nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border px-6 flex items-center justify-between z-50 pb-safe" >

                {
                    navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-200",
                                    isActive ? "text-bouteek-green scale-110" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-2xl transition-all duration-200",
                                    isActive ? "bg-bouteek-green/20" : "bg-transparent"
                                )}>
                                    <Icon size={24} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })
                }
            </nav >

            {/* Global FAB (Mobile) */}
            < Button
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-bouteek-green shadow-xl shadow-bouteek-green/40 flex items-center justify-center text-white z-40 transition-transform active:scale-95"
                onClick={() => router.push("/dashboard/store/new")
                }
            >
                <Plus size={28} />
            </Button >
        </div >
    );
}

