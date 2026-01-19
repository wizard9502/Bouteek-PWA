"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
    LayoutGrid,
    Palette,
    Type,
    Image as ImageIcon,
    Save,
    Check,
    Smartphone,
    Monitor,
    MousePointer2,
    Store,
    Layers,
    ToggleLeft,
    ToggleRight,
    Calendar,
    Briefcase,
    ShoppingBag,
    MessageSquareQuote,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StoreBuilderPage() {
    return (
        <StoreBuilderContent />
    );
}

function StoreBuilderContent() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("templates"); // templates, modules, design, content
    const [selectedTemplate, setSelectedTemplate] = useState("modern_minimal");
    const [viewMode, setViewMode] = useState("mobile"); // mobile, desktop

    // Module States
    const [modules, setModules] = useState({
        sales: true,
        rentals: false,
        services: false,
        testimonials: false,
        blog: false
    });


    // Customization State
    const [storeConfig, setStoreConfig] = useState<any>({
        primaryColor: "#050505",
        secondaryColor: "#ffffff",
        accentColor: "#00D632",
        fontFamily: "Inter",
        heroTitle: "New Arrivals",
        heroSubtitle: "Discover our latest collection",
        buttonText: "Shop Now",
        heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        blogTitle: "Latest from Blog",
        testimonialsTitle: "What People Say",
        testimonialAuthor: "Jane Doe"
    });

    const [isLoading, setIsLoading] = useState(true);
    const [customDomain, setCustomDomain] = useState("");
    const [subscriptionTier, setSubscriptionTier] = useState("starter"); // starter, growth, pro
    const [domainStatus, setDomainStatus] = useState("pending"); // pending, verified, failed

    useEffect(() => {
        loadStoreData();
    }, []);

    const loadStoreData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Wait for auth middleware or use separate loading state

            const { data: merchant } = await supabase.from('merchants').select('id, subscription_tier').eq('user_id', user.id).single();
            if (!merchant) return;

            setSubscriptionTier(merchant.subscription_tier || "starter");

            const { data: storefront } = await supabase.from('storefronts').select('*').eq('merchant_id', merchant.id).single();

            if (storefront) {
                setModules({
                    sales: storefront.enable_sales ?? true,
                    rentals: storefront.enable_rentals ?? false,
                    services: storefront.enable_services ?? false,
                    testimonials: storefront.enable_testimonials ?? false,
                    blog: storefront.enable_blog ?? false
                });

                if (storefront.template_id) setSelectedTemplate(storefront.template_id);
                if (storefront.theme_config) setStoreConfig(prev => ({ ...prev, ...storefront.theme_config }));
                if (storefront.custom_domain) setCustomDomain(storefront.custom_domain);
                if (storefront.custom_domain_status) setDomainStatus(storefront.custom_domain_status);
            }
        } catch (error) {
            console.error("Error loading store data:", error);
            toast.error("Failed to load store data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
        if (!merchant) {
            setIsLoading(false);
            return;
        }

        // Consolidated Storefront Data Object
        const storefrontData = {
            merchant_id: merchant.id,
            template_id: selectedTemplate,
            theme_config: {
                ...storeConfig,
                // Ensure explicit mapping of new fields
                primaryColor: storeConfig.primaryColor,
                accentColor: storeConfig.accentColor,
                heroTitle: storeConfig.heroTitle,
                heroSubtitle: storeConfig.heroSubtitle,
                blogTitle: storeConfig.blogTitle,
                testimonialsTitle: storeConfig.testimonialsTitle,
                testimonialAuthor: storeConfig.testimonialAuthor
            },
            enable_sales: modules.sales,
            enable_rentals: modules.rentals,
            enable_services: modules.services,
            enable_testimonials: modules.testimonials,
            enable_blog: modules.blog,
            custom_domain: customDomain,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('storefronts').upsert(storefrontData, { onConflict: 'merchant_id' });

        if (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        } else {
            toast.success("Storefront saved successfully!");
        }
        setIsLoading(false);
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Store Builder...</div>;


    const templates = [
        {
            id: "modern_minimal",
            name: "Modern Ecommerce",
            description: "Clean lines, whitespace, and focus on product photography.",
            defaultColors: { primary: "#000000", accent: "#00D632" },
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "bold_vibrant",
            name: "Corporate Business",
            description: "Professional layout with team sections and clear service offerings.",
            defaultColors: { primary: "#1e3a8a", accent: "#3b82f6" },
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "classic_boutique",
            name: "Service Booking",
            description: "Optimized for appointments, salons, and consultancies.",
            defaultColors: { primary: "#78350f", accent: "#d97706" },
            image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "dark_mode_pro",
            name: "Luxury Premium",
            description: "Sleek, premium dark interface for luxury items.",
            defaultColors: { primary: "#000000", accent: "#fbbf24" },
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "grid_masonry",
            name: "Minimalist Clean",
            description: "Sophisticated 'less is more' design for high-end retail.",
            defaultColors: { primary: "#404040", accent: "#737373" },
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "chic_vogue",
            name: "Chic Vogue",
            description: "Playful pink aesthetics perfect for fashion and beauty.",
            defaultColors: { primary: "#ec4899", accent: "#db2777" },
            image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "blush_blossom",
            name: "Blush Blossom",
            description: "Soft, elegant pink theme with floral accents and serif typography.",
            defaultColors: { primary: "#f472b6", accent: "#fb7185" },
            image: "https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=2000&auto=format&fit=crop"
        },

        {
            id: "urban_street",
            name: "Urban Streetwear",
            description: "Bold, gritty, and high-contrast dark theme.",
            defaultColors: { primary: "#171717", accent: "#dc2626" },
            image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "eco_nature",
            name: "Eco Nature",
            description: "Fresh greens and organic vibes for sustainable brands.",
            defaultColors: { primary: "#15803d", accent: "#86efac" },
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "tech_gadget",
            name: "Tech Gadget",
            description: "Futuristic blues and clean lines for electronics.",
            defaultColors: { primary: "#2563eb", accent: "#60a5fa" },
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "artisan_craft",
            name: "Artisan Craft",
            description: "Warm earth tones for handmade and artisanal products.",
            defaultColors: { primary: "#92400e", accent: "#fcd34d" },
            image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "gourmet_delights",
            name: "Gourmet Delights",
            description: "Appetizing layout for restaurants and food delivery.",
            defaultColors: { primary: "#ea580c", accent: "#fbbf24" },
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "pixel_perfect",
            name: "Pixel Perfect",
            description: "Cyberpunk aesthetic for gaming and digital products.",
            defaultColors: { primary: "#7e22ce", accent: "#22d3ee" },
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "serene_spa",
            name: "Serene Spa",
            description: "Calm and peaceful design for wellness and beauty.",
            defaultColors: { primary: "#0d9488", accent: "#99f6e4" },
            image: "https://images.unsplash.com/photo-1544161515-4af6b1d4640b?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "vintage_vault",
            name: "Vintage Vault",
            description: "Classic, retro feel for antiques and nostalgia.",
            defaultColors: { primary: "#451a03", accent: "#b45309" },
            image: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "neon_night",
            name: "Neon Night",
            description: "High-energy neon theme for nightlife and events.",
            defaultColors: { primary: "#db2777", accent: "#a855f7" },
            image: "https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "organic_oasis",
            name: "Organic Oasis",
            description: "Eco-friendly design with organic shapes and earthy greens.",
            defaultColors: { primary: "#166534", accent: "#4ade80" },
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "midnight_muse",
            name: "Midnight Muse",
            description: "Mysterious and elegant theme with deep blacks and gold accents.",
            defaultColors: { primary: "#0a0a0a", accent: "#fbbf24" },
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "pastel_paradise",
            name: "Pastel Paradise",
            description: "Soft, dreamy colors for a friendly and approachable feel.",
            defaultColors: { primary: "#f472b6", accent: "#93c5fd" },
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "golden_glam",
            name: "Golden Glam",
            description: "Luxury and high fashion with sophisticated gold and serif typography.",
            defaultColors: { primary: "#451a03", accent: "#d97706" },
            image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "tech_titan",
            name: "Tech Titan",
            description: "Cutting-edge design for high-tech hardware and gaming.",
            defaultColors: { primary: "#1e3a8a", accent: "#06b6d4" },
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"
        }


    ];

    const toggleModule = (key: keyof typeof modules) => {
        setModules(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateConfig = (key: string, value: string) => {
        setStoreConfig(prev => ({ ...prev, [key]: value }));
    };

    // Live Preview Component
    const PreviewContent = () => {
        // Dynamic styles based on config
        const containerStyle = { fontFamily: storeConfig.fontFamily };
        const heroStyle = {
            backgroundColor: selectedTemplate === 'dark_mode_pro' ? storeConfig.primaryColor : '#f4f4f5',
            color: selectedTemplate === 'dark_mode_pro' ? '#fff' : storeConfig.primaryColor,
            backgroundImage: selectedTemplate === 'bold_vibrant' || selectedTemplate === 'modern_minimal' ? `url(${storeConfig.heroImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
        const buttonStyle = { backgroundColor: storeConfig.accentColor, color: '#fff' };

        return (
            <div className="w-full min-h-full bg-white text-foreground" style={containerStyle}>
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/10">
                    <div className="font-black text-xl tracking-tighter" style={{ color: storeConfig.primaryColor }}>LOGO</div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingBag size={14} />
                    </div>
                </header>

                {/* Hero Section */}
                <section className={cn(
                    "relative mx-4 mt-4 rounded-3xl overflow-hidden flex items-center justify-center text-center p-10 transition-all",
                    selectedTemplate === 'grid_masonry' ? 'h-[40vh]' : 'h-[50vh]'
                )} style={heroStyle}>

                    {/* Overlay for bg images */}
                    {(selectedTemplate === 'bold_vibrant' || selectedTemplate === 'modern_minimal') && (
                        <div className="absolute inset-0 bg-black/30 z-0" />
                    )}

                    <div className="relative z-10 space-y-4 max-w-md mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: (selectedTemplate === 'bold_vibrant' || selectedTemplate === 'modern_minimal') ? '#fff' : 'inherit' }}>
                            {storeConfig.heroTitle}
                        </h2>
                        <p className="text-sm font-medium opacity-90" style={{ color: (selectedTemplate === 'bold_vibrant' || selectedTemplate === 'modern_minimal') ? '#eee' : 'inherit' }}>
                            {storeConfig.heroSubtitle}
                        </p>
                        <button
                            className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-lg"
                            style={buttonStyle}
                        >
                            {storeConfig.buttonText}
                        </button>
                    </div>
                </section>

                {/* Modules Content */}
                <div className="p-6 space-y-12">
                    {modules.sales && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-xl" style={{ color: storeConfig.primaryColor }}>Featured</h3>
                                <span className="text-xs font-bold underline cursor-pointer">View All</span>
                            </div>
                            <div className={cn(
                                "grid gap-4",
                                selectedTemplate === 'grid_masonry' ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                            )}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="aspect-[3/4] bg-muted rounded-2xl mb-3 overflow-hidden">
                                            <div className="w-full h-full bg-gray-100 group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <h4 className="font-bold text-sm truncate">Product Name {i}</h4>
                                        <p className="text-xs opacity-60">15,000 XOF</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {modules.rentals && (
                        <section className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-orange-950">Rent Equipment</h3>
                                    <p className="text-xs text-orange-700">Daily rates available</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">
                                Check Availability
                            </button>
                        </section>
                    )}

                    {modules.services && (
                        <section className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-500">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-purple-950">Book Services</h3>
                                    <p className="text-xs text-purple-700">1 Hour Sessions</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors">
                                Book Appointment
                            </button>
                        </section>
                    )}

                    {modules.blog && (
                        <section className="space-y-6">
                            <h3 className="font-black text-xl" style={{ color: storeConfig.primaryColor }}>{storeConfig.blogTitle || "Latest from Blog"}</h3>
                            <div className="grid gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex gap-4 group cursor-pointer bg-muted/20 p-4 rounded-3xl border border-border/5">
                                        <div className="w-24 h-24 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                                            <div className="w-full h-full bg-gray-200 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-bold text-sm mb-1 leading-tight">Trending Styles...</h4>
                                            <p className="text-[10px] opacity-60 mb-2">Jan 12, 2025 • 5 min read</p>
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: storeConfig.accentColor }}>Read More</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {modules.testimonials && (
                        <section className="space-y-6">
                            <h3 className="font-black text-xl text-center" style={{ color: storeConfig.primaryColor }}>{storeConfig.testimonialsTitle || "What People Say"}</h3>
                            <div className="flex bg-muted/30 p-6 rounded-3xl gap-4 border border-border/10">
                                <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: storeConfig.accentColor + '20', color: storeConfig.accentColor }}>J</div>
                                <div>
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <div key={star} className="w-2 h-2 rounded-full" style={{ backgroundColor: storeConfig.accentColor }} />
                                        ))}
                                    </div>
                                    <p className="text-sm italic opacity-80 mb-2 leading-relaxed">"Great products and amazing service..."</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: storeConfig.accentColor }}>- {storeConfig.testimonialAuthor || "Jane Doe"}</p>
                                </div>
                            </div>
                        </section>
                    )}

                </div>

                {/* Footer */}
                <footer className="bg-black text-white p-10 mt-10">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h5 className="font-bold mb-4">Shop</h5>
                            <div className="space-y-2 text-sm opacity-60">
                                <p>All Products</p>
                                <p>New Arrivals</p>
                                <p>Featured</p>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">Support</h5>
                            <div className="space-y-2 text-sm opacity-60">
                                <p>FAQ</p>
                                <p>Shipping</p>
                                <p>Returns</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 text-center">
                        <p className="text-xs opacity-40">Powered by Bouteek</p>
                    </div>
                </footer>
            </div>
        );
    };



    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar: Controls */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6 h-full overflow-y-auto pb-10">
                <div>
                    <h1 className="hero-text !text-3xl">Store Builder</h1>
                    <p className="text-muted-foreground font-medium mt-1">Design your perfect storefront.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-muted p-1 rounded-2xl">
                    {[
                        { id: "templates", icon: LayoutGrid, label: "Templates" },
                        { id: "modules", icon: Layers, label: "Modules" },
                        { id: "design", icon: Palette, label: "Design" },
                        { id: "content", icon: Type, label: "Content" }, // Added Content tab
                        { id: "settings", icon: Globe, label: "Settings" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                activeTab === tab.id ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area Based on Tab */}
                <div className="flex-1 space-y-6">
                    {activeTab === "templates" && (
                        <div className="space-y-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template.id);
                                        // Auto-apply defaults
                                        setStoreConfig(prev => ({ ...prev, primaryColor: template.defaultColors.primary, accentColor: template.defaultColors.accent }));
                                        toast.success("Theme selected: " + template.name);
                                    }}
                                    className={cn(
                                        "p-4 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                        selectedTemplate === template.id ? "border-bouteek-green bg-bouteek-green/5" : "border-border/50 bg-card"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Use generated image thumbnail */}
                                        <div className="w-16 h-16 rounded-2xl flex-shrink-0 bg-muted overflow-hidden">
                                            <img src={template.image} className="w-full h-full object-cover" alt={template.name} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">{template.name}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                        </div>
                                        {selectedTemplate === template.id && (
                                            <div className="ml-auto bg-bouteek-green text-black rounded-full p-1">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "modules" && (
                        <div className="space-y-6">
                            <div className="bouteek-card p-6 space-y-6">
                                <h3 className="font-black text-xl">Store Capabilities</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><ShoppingBag size={20} /></div>
                                            <div><p className="font-black text-sm">Product Sales</p></div>
                                        </div>
                                        <Switch checked={modules.sales} onCheckedChange={() => toggleModule('sales')} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Calendar size={20} /></div>
                                            <div><p className="font-black text-sm">Rentals</p></div>
                                        </div>
                                        <Switch checked={modules.rentals} onCheckedChange={() => toggleModule('rentals')} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Briefcase size={20} /></div>
                                            <div><p className="font-black text-sm">Services</p></div>
                                        </div>
                                        <Switch checked={modules.services} onCheckedChange={() => toggleModule('services')} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><MessageSquareQuote size={20} /></div>
                                            <div><p className="font-black text-sm">Testimonials</p></div>
                                        </div>
                                        <Switch checked={modules.testimonials} onCheckedChange={() => toggleModule('testimonials')} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><LayoutGrid size={20} /></div>
                                            <div><p className="font-black text-sm">Blog & News</p></div>
                                        </div>
                                        <Switch checked={modules.blog} onCheckedChange={() => toggleModule('blog')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}

                    {activeTab === "design" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Branding & Colors</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                                                value={storeConfig.primaryColor}
                                                onChange={(e) => updateConfig('primaryColor', e.target.value)}
                                            />
                                            <Input
                                                value={storeConfig.primaryColor}
                                                onChange={(e) => updateConfig('primaryColor', e.target.value)}
                                                className="flex-1 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Accent Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                className="w-12 h-12 p-1 rounded-xl cursor-pointer"
                                                value={storeConfig.accentColor}
                                                onChange={(e) => updateConfig('accentColor', e.target.value)}
                                            />
                                            <Input
                                                value={storeConfig.accentColor}
                                                onChange={(e) => updateConfig('accentColor', e.target.value)}
                                                className="flex-1 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Hero Content</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Headline</Label>
                                        <Input
                                            value={storeConfig.heroTitle}
                                            onChange={(e) => updateConfig('heroTitle', e.target.value)}
                                            className="rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subtitle</Label>
                                        <Input
                                            value={storeConfig.heroSubtitle}
                                            onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Button Text</Label>
                                        <Input
                                            value={storeConfig.buttonText}
                                            onChange={(e) => updateConfig('buttonText', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    )}

                {activeTab === "content" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bouteek-card p-6 space-y-4">
                            <h3 className="font-black text-lg">Section Titles</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Blog Section Title</Label>
                                    <Input
                                        value={storeConfig.blogTitle || "Latest from Blog"}
                                        onChange={(e) => updateConfig('blogTitle', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Testimonials Title</Label>
                                    <Input
                                        value={storeConfig.testimonialsTitle || "What People Say"}
                                        onChange={(e) => updateConfig('testimonialsTitle', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Testimonial Author</Label>
                                    <Input
                                        value={storeConfig.testimonialAuthor || "Jane Doe"}
                                        onChange={(e) => updateConfig('testimonialAuthor', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bouteek-card p-6 space-y-4">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <Globe size={18} />
                                Custom Domain
                            </h3>

                            {subscriptionTier === 'growth' || subscriptionTier === 'pro' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Domain Name</Label>
                                        <Input
                                            placeholder="e.g. mystore.com"
                                            value={customDomain}
                                            onChange={(e) => setCustomDomain(e.target.value)}
                                            className="rounded-xl font-bold"
                                        />
                                        <p className="text-xs text-muted-foreground">Enter your domain without http:// or https://</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            DNS Configuration Required
                                        </div>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            To connect your domain, please add the following record to your domain provider's DNS settings:
                                        </p>
                                        <div className="bg-white rounded-lg border border-blue-200 p-3 font-mono text-xs overflow-x-auto">
                                            <div className="grid grid-cols-[80px_1fr] gap-2">
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="font-bold">CNAME</span>
                                                <span className="text-muted-foreground">Name:</span>
                                                <span className="font-bold">@ (or www)</span>
                                                <span className="text-muted-foreground">Value:</span>
                                                <span className="text-blue-600 font-bold">connect.bouteek.com</span>
                                            </div>
                                        </div>
                                    </div>

                                    {domainStatus !== 'pending' && (
                                        <div className={cn(
                                            "p-4 rounded-xl border flex items-center gap-3",
                                            domainStatus === 'verified' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                                        )}>
                                            {domainStatus === 'verified' ? <Check size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />}
                                            <div>
                                                <p className="text-sm font-bold capitalize">{domainStatus} Status</p>
                                                <p className="text-xs opacity-80">
                                                    {domainStatus === 'verified' ? "Your domain is active!" : "We verified your domain settings."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 space-y-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                        <Store size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-lg">Upgrade to Connect Domain</h4>
                                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                            Custom domains are available on Growth and Pro plans.
                                        </p>
                                    </div>
                                    <Button className="rounded-full bg-black text-white font-bold" disabled>
                                        Upgrade Plan (Coming Soon)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full h-14 rounded-2xl bg-black text-white font-black text-lg shadow-xl shadow-black/20 mt-auto">
                <Save className="mr-2" size={20} />
                {isLoading ? "Saving..." : "Save & Publish"}
            </Button>
        </div>

            {/* Right Side: Preview */ }
    <div className="flex-1 bg-muted/30 rounded-4xl border-2 border-dashed border-border/50 p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all">
        {/* View Toggles */}
        <div className="absolute top-6 flex bg-white rounded-full p-1 shadow-sm border border-border/50 z-20">
            <button
                onClick={() => setViewMode("mobile")}
                className={cn("p-2 rounded-full transition-colors", viewMode === "mobile" ? "bg-black text-white" : "text-muted-foreground hover:bg-muted")}
            >
                <Smartphone size={20} />
            </button>
            <button
                onClick={() => setViewMode("desktop")}
                className={cn("p-2 rounded-full transition-colors", viewMode === "desktop" ? "bg-black text-white" : "text-muted-foreground hover:bg-muted")}
            >
                <Monitor size={20} />
            </button>
        </div>

        {/* Mobile/Desktop Preview Frame */}
        <motion.div
            layout
            className={cn(
                "bg-white shadow-2xl border-4 border-zinc-900 overflow-hidden relative transition-all duration-500",
                viewMode === "mobile" ? "w-[375px] h-[750px] rounded-[3rem]" : "w-full h-full rounded-xl max-w-5xl"
            )}
        >
            {/* Mock Browser Header for Desktop / Notch for Mobile */}
            {viewMode === "mobile" ? (
                <div className="absolute top-0 left-0 right-0 h-7 bg-black z-50 flex justify-center">
                    <div className="w-32 h-5 bg-black rounded-b-2xl" />
                </div>
            ) : null}

            {/* LIVE Preview Component */}
            <div className="w-full h-full overflow-y-auto bg-white">
                <PreviewContent />
            </div>
        </motion.div>
    </div>
        </div >
    );
}
