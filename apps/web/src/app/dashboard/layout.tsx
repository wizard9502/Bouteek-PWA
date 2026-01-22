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
    Heart,
    ChevronRight,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TranslationProvider, useTranslation } from "@/contexts/TranslationContext";

import { TawkToChat } from "@/components/TawkToChat";

import { NotificationsManager } from "@/components/NotificationsManager";
import SuspensionGuard from "@/components/SuspensionGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <TranslationProvider>
            <NotificationsManager />
            <SuspensionGuard>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </SuspensionGuard>
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
    const [isSubdomain, setIsSubdomain] = useState(false);
    const [colorTheme, setColorTheme] = useState<string>('default');

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
                        // If the stored theme is one of our valid colors, use it
                        // Otherwise default to standard handling or ignore if it was 'dark'/'light' legacy
                        if (['pink', 'purple', 'ocean', 'luxury', 'sunset'].includes(merchant.preferred_theme)) {
                            setColorTheme(merchant.preferred_theme);
                        }
                    }
                }
            }
        };
        fetchUser();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Detect if we're on dashboard.bouteek.shop subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bouteek.shop";
            setIsSubdomain(hostname === `dashboard.${rootDomain}` || hostname.startsWith("dashboard."));
        }
    }, []);

    // Generate correct href based on subdomain
    const getHref = (path: string) => {
        if (isSubdomain) {
            // On dashboard.bouteek.shop, remove /dashboard prefix
            return path === "/dashboard" ? "/" : path.replace("/dashboard", "");
        }
        return path;
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const handleColorChange = async (newColor: string) => {
        setColorTheme(newColor);
        if (user?.id) {
            await supabase.from('merchants').update({ preferred_theme: newColor }).eq('id', user.id);
        }
    };

    const navItems = [
        { href: "/dashboard", label: "Analytics", icon: LayoutDashboard }, // Renamed from Dashboard
        { href: "/dashboard/store", label: t("sidebar.store"), icon: Store },
        { href: "/dashboard/orders", label: t("sidebar.orders"), icon: ShoppingCart },
        { href: "/dashboard/finance", label: t("sidebar.billing") || "Billing & Subscriptions", icon: Wallet },
        { href: "/dashboard/profile", label: t("sidebar.profile"), icon: UserCircle },
    ];

    const colorOptions = [
        { id: 'default', color: 'bg-zinc-900 dark:bg-white', label: 'Default' },
        { id: 'pink', color: 'bg-pink-500', label: 'Pink' },
        { id: 'purple', color: 'bg-purple-600', label: 'Purple' },
        { id: 'ocean', color: 'bg-blue-500', label: 'Ocean' },
        { id: 'luxury', color: 'bg-amber-500', label: 'Luxury' },
        { id: 'sunset', color: 'bg-orange-500', label: 'Sunset' },
    ];

    return (
        <div className={cn("min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden transition-colors duration-300", colorTheme)}>
            <TawkToChat user={user} />
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300">
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10">
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
                                href={getHref(item.href)}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
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
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            {/* Color Theme Popover */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-10 border-border/50">
                                        <div className={cn("w-4 h-4 rounded-full border", colorOptions.find(c => c.id === colorTheme)?.color)} />
                                        <span className="text-xs font-bold">Theme</span>
                                        <ChevronRight size={14} className="ml-auto opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 rounded-2xl" align="start" side="right">
                                    <div className="grid grid-cols-1 gap-1">
                                        {colorOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleColorChange(option.id)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium",
                                                    colorTheme === option.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                                                )}
                                            >
                                                <div className={cn("w-4 h-4 rounded-full border", option.color)} />
                                                {option.label}
                                                {colorTheme === option.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex gap-2">
                            {/* Dark Mode Toggle */}
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl border-border/50 h-10"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                <span className="ml-2 text-xs font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                            </Button>

                            {/* Language Toggle */}
                            <div className="flex bg-muted p-1 rounded-xl flex-1 border border-border/50">
                                <button
                                    onClick={() => setLanguage('fr')}
                                    className={cn("flex-1 rounded-lg text-[10px] font-black transition-all", language === 'fr' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                                >
                                    FR
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={cn("flex-1 rounded-lg text-[10px] font-black transition-all", language === 'en' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-muted/40 border border-border/50 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary select-none">
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
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
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
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border px-6 flex items-center justify-between z-50 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
                {[
                    navItems.find(i => i.href === "/dashboard/store"),
                    navItems.find(i => i.href === "/dashboard/orders"),
                    navItems.find(i => i.href === "/dashboard"),
                    navItems.find(i => i.href === "/dashboard/finance"),
                    navItems.find(i => i.href === "/dashboard/profile"),
                ].filter(Boolean).map((item, index) => {
                    // Force non-null assertion since we know these exist
                    if (!item) return null;

                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                    const isMiddle = index === 2; // Dashboard is now in the middle (index 2 of 5)

                    if (isMiddle) {
                        return (
                            <Link
                                key={item.href}
                                href={getHref(item.href)}
                                className="relative -top-8 flex flex-col items-center justify-center"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/50 ring-4 ring-background"
                                        : "bg-muted text-muted-foreground hover:scale-105 ring-4 ring-background"
                                )}>
                                    <Icon size={28} strokeWidth={2.5} />
                                </div>
                                <span className={cn(
                                    "absolute -bottom-6 text-[10px] font-black uppercase tracking-widest transition-all",
                                    isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-0"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={getHref(item.href)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-200 w-12",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-200",
                                isActive ? "bg-primary/10 translate-y-[-2px]" : "bg-transparent"
                            )}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tighter transition-all",
                                isActive ? "scale-110 font-black" : "scale-100"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Global FAB (Mobile) */}
            < Button
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center text-primary-foreground z-40 transition-transform active:scale-95"
                onClick={() => router.push(getHref("/dashboard/listings/new"))
                }
            >
                <Plus size={28} />
            </ Button >
        </div >
    );
}
