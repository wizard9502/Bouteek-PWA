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
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

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
        blog: false,
        faq: false,
        newsletter: false,
        instagram: false,
        countdown: false,
        contact: false
    });


    // Customization State
    const [storeConfig, setStoreConfig] = useState<any>({
        // Branding
        logo: "",
        businessName: "",
        tagline: "",

        // Colors & Typography
        primaryColor: "#050505",
        secondaryColor: "#ffffff",
        accentColor: "#00FF41",
        fontFamily: "Inter",
        fontSize: "16px",

        // Hero Section
        heroTitle: "New Arrivals",
        heroSubtitle: "Discover our latest collection",
        buttonText: "Shop Now",
        heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",

        // About Us Section
        aboutTitle: "About Us",
        aboutContent: "We are passionate about bringing you the best products at great prices. Our mission is to make shopping easy and enjoyable.",
        aboutImage: "",

        // Footer
        footerTagline: "Your trusted online store",
        footerAddress: "Dakar, Senegal",
        footerEmail: "contact@yourstore.com",
        footerPhone: "+221 77 000 00 00",

        // Other sections
        blogTitle: "Latest from Blog",
        testimonialsTitle: "What People Say",
        testimonialAuthor: "Jane Doe",
        faqTitle: "Frequently Asked Questions",
        newsletterTitle: "Stay Updated",
        instagramUsername: "@yourstore",
        countdownTitle: "Limited Time Offer",
        contactTitle: "Get In Touch"
    });

    const [isLoading, setIsLoading] = useState(true);
    const [customDomain, setCustomDomain] = useState("");
    const [subscriptionTier, setSubscriptionTier] = useState("starter"); // starter, growth, pro
    const [domainStatus, setDomainStatus] = useState("pending"); // pending, verified, failed

    // Social Links State
    const [socialLinks, setSocialLinks] = useState({
        instagram: "",
        snapchat: "",
        tiktok: ""
    });

    const [merchantProducts, setMerchantProducts] = useState<any[]>([]);

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
                if (storefront.social_links) {
                    const links = typeof storefront.social_links === 'string'
                        ? JSON.parse(storefront.social_links)
                        : storefront.social_links;
                    setSocialLinks(prev => ({ ...prev, ...links }));
                }
            }

            // Fetch merchant's actual products
            if (merchant.id) {
                const { data: products } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('store_id', merchant.id)
                    .eq('is_active', true)
                    .limit(8);

                setMerchantProducts(products || []);
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
            social_links: socialLinks,
            updated_at: new Date().toISOString()
        };

        const { error, data: savedStorefront } = await supabase.from('storefronts').upsert(storefrontData, { onConflict: 'merchant_id' }).select('id').single();

        if (error) {
            console.error(error);
            toast.error("Failed to save changes. Please try again.");
        } else {
            // Now publish the storefront to make it live
            if (savedStorefront?.id) {
                const { data: publishResult, error: publishError } = await supabase.rpc('publish_storefront', {
                    p_storefront_id: savedStorefront.id
                });

                if (publishError) {
                    console.error('Publish error:', publishError);
                    toast.warning("Saved, but failed to publish. Try again.");
                } else if (publishResult?.success) {
                    // Haptic feedback on save (PWA)
                    if ('vibrate' in navigator) {
                        navigator.vibrate(50);
                    }
                    toast.success("Storefront saved and published! 🚀");
                } else {
                    toast.error(publishResult?.message || "Failed to publish");
                }
            } else {
                toast.success("Storefront saved successfully!");
            }
        }
        setIsLoading(false);
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Store Builder...</div>;


    const templates = [
        {
            id: "modern_minimal",
            name: "Modern Ecommerce",
            description: "Clean lines, whitespace, and focus on product photography.",
            defaultColors: { primary: "#000000", accent: "#00FF41" },
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
        // Gating Logic
        if (subscriptionTier === "starter" && key !== "sales") {
            toast.error("Upgrade to Growth or Pro to unlock this module!");
            return;
        }
        if (subscriptionTier === "growth" && (key === "testimonials" || key === "blog")) {
            toast.error("Upgrade to Pro to unlock this module!");
            return;
        }
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
                    <div className="flex items-center gap-3">
                        {storeConfig.logo ? (
                            <img src={storeConfig.logo} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="font-black text-xl tracking-tighter" style={{ color: storeConfig.primaryColor }}>
                                {storeConfig.businessName || "LOGO"}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex gap-6 text-sm font-medium opacity-70">
                            <span>Home</span>
                            <span>Shop</span>
                            {modules.blog && <span>Blog</span>}
                            <span>About</span>
                        </nav>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative">
                            <ShoppingBag size={14} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        </div>
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
                                {merchantProducts.length > 0 ? (
                                    merchantProducts.slice(0, 4).map(product => (
                                        <div key={product.id} className="group cursor-pointer">
                                            <div className="aspect-[3/4] bg-muted rounded-2xl mb-3 overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 group-hover:scale-105 transition-transform duration-500" />
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm truncate">{product.name}</h4>
                                            <p className="text-xs opacity-60">{product.price?.toLocaleString()} XOF</p>
                                        </div>
                                    ))
                                ) : (
                                    // Fallback to placeholders if no products
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="aspect-[3/4] bg-muted rounded-2xl mb-3 overflow-hidden">
                                                <div className="w-full h-full bg-gray-100 group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <h4 className="font-bold text-sm truncate">Product Name {i}</h4>
                                            <p className="text-xs opacity-60">15,000 XOF</p>
                                        </div>
                                    ))
                                )}
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


                {/* About Us Section */}
                {storeConfig.aboutTitle && (
                    <section className="py-16 px-6 bg-muted/20">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <h2 className="text-3xl font-black" style={{ color: storeConfig.primaryColor }}>{storeConfig.aboutTitle}</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{storeConfig.aboutContent}</p>
                            </div>
                            {storeConfig.aboutImage && (
                                <div className="flex-1 w-full max-w-sm">
                                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl rotate-3 bg-white p-2">
                                        <img src={storeConfig.aboutImage} alt="About" className="w-full h-full object-cover rounded-2xl" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="bg-black text-white p-10 mt-10">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="md:col-span-2 space-y-4">
                            {storeConfig.logo ? (
                                <img src={storeConfig.logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                            ) : (
                                <div className="font-black text-2xl tracking-tighter">{storeConfig.businessName || "My Store"}</div>
                            )}
                            <p className="opacity-60 text-sm max-w-sm">{storeConfig.footerTagline}</p>
                        </div>

                        <div>
                            <h5 className="font-bold mb-4">Contact</h5>
                            <div className="space-y-2 text-sm opacity-60">
                                <p>{storeConfig.footerAddress}</p>
                                <p>{storeConfig.footerEmail}</p>
                                <p>{storeConfig.footerPhone}</p>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-bold mb-4">Links</h5>
                            <div className="space-y-2 text-sm opacity-60">
                                <p>Shop All</p>
                                <p>About Us</p>
                                <p>Contact</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Icons */}
                    {(socialLinks.instagram || socialLinks.snapchat || socialLinks.tiktok) && (
                        <div className="flex gap-6 mb-8 pt-8 border-t border-white/10">
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            )}
                            {socialLinks.snapchat && (
                                <a href={socialLinks.snapchat} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.076-.375-.089-.883-.194-1.513-.194-.6 0-1.05.074-1.336.138-.27.074-.51.18-.72.273-.585.27-1.094.496-2.057.496-1.008 0-1.517-.24-2.057-.496-.21-.104-.449-.198-.72-.273-.285-.064-.735-.138-1.335-.138-.63 0-1.14.105-1.515.194-.225.045-.4.076-.536.076-.33 0-.525-.15-.585-.4-.061-.195-.105-.376-.135-.556-.044-.195-.104-.479-.164-.57-1.87-.283-2.904-.702-3.144-1.271-.03-.076-.046-.15-.046-.225-.015-.24.166-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.044-.242-.09-.346-.119-.825-.329-1.228-.719-1.228-1.168 0-.36.284-.689.735-.838.15-.061.328-.09.509-.09.121 0 .3.015.465.104.359.179.715.301.959.301.271 0 .389-.09.445-.119l-.016-.06c-.104-1.627-.225-3.654.3-4.847C7.711 1.069 11.084.793 12.086.793h.12z" /></svg>
                                </a>
                            )}
                            {socialLinks.tiktok && (
                                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                                </a>
                            )}
                        </div>
                    )}

                    <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs opacity-40">© {new Date().getFullYear()} {storeConfig.businessName || "My Store"}. All rights reserved.</p>
                        <a href="https://bouteek.shop" target="_blank" rel="noopener noreferrer" className="text-xs opacity-40 hover:opacity-70 transition-opacity flex items-center gap-1">
                            Powered by <span className="font-bold">Bouteek</span>
                        </a>
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
                        { id: "branding", icon: ImageIcon, label: "Branding" },
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
                    {activeTab === "branding" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Identity</h3>
                                <div className="space-y-4">
                                    <ImageUpload
                                        label="Store Logo"
                                        currentImage={storeConfig.logo}
                                        onImageChange={(url) => updateConfig('logo', url)}
                                        aspectRatio="aspect-square w-24"
                                    />
                                    <div className="space-y-2">
                                        <Label>Business Name</Label>
                                        <Input
                                            value={storeConfig.businessName}
                                            onChange={(e) => updateConfig('businessName', e.target.value)}
                                            placeholder="My Awesome Store"
                                            className="rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tagline</Label>
                                        <Input
                                            value={storeConfig.tagline}
                                            onChange={(e) => updateConfig('tagline', e.target.value)}
                                            placeholder="Best products in town"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Hero Section</h3>
                                <div className="space-y-4">
                                    <ImageUpload
                                        label="Hero Background Image"
                                        currentImage={storeConfig.heroImage}
                                        onImageChange={(url) => updateConfig('heroImage', url)}
                                        maxSizeMB={5}
                                    />
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
                    )}

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

                    )}

                    {activeTab === "content" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">About Us Section</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Section Title</Label>
                                        <Input
                                            value={storeConfig.aboutTitle}
                                            onChange={(e) => updateConfig('aboutTitle', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <RichTextEditor
                                        label="Content"
                                        value={storeConfig.aboutContent}
                                        onChange={(val) => updateConfig('aboutContent', val)}
                                        placeholder="Tell your story..."
                                    />
                                    <ImageUpload
                                        label="About Image (Optional)"
                                        currentImage={storeConfig.aboutImage}
                                        onImageChange={(url) => updateConfig('aboutImage', url)}
                                    />
                                </div>
                            </div>

                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Footer Content</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Footer Tagline</Label>
                                        <Input
                                            value={storeConfig.footerTagline}
                                            onChange={(e) => updateConfig('footerTagline', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input
                                            value={storeConfig.footerAddress}
                                            onChange={(e) => updateConfig('footerAddress', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                value={storeConfig.footerEmail}
                                                onChange={(e) => updateConfig('footerEmail', e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input
                                                value={storeConfig.footerPhone}
                                                onChange={(e) => updateConfig('footerPhone', e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

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

                            {/* Social Links Section */}
                            <div className="bouteek-card p-6 space-y-4">
                                <h3 className="font-black text-lg">Social Media Links</h3>
                                <p className="text-xs text-muted-foreground">Add your social media profiles to display in your store footer.</p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" /></svg>
                                            Instagram
                                        </Label>
                                        <Input
                                            placeholder="https://instagram.com/yourstore"
                                            value={socialLinks.instagram}
                                            onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.076-.375-.089-.883-.194-1.513-.194-.6 0-1.05.074-1.336.138-.27.074-.51.18-.72.273-.585.27-1.094.496-2.057.496-1.008 0-1.517-.24-2.057-.496-.21-.104-.449-.198-.72-.273-.285-.064-.735-.138-1.335-.138-.63 0-1.14.105-1.515.194-.225.045-.4.076-.536.076-.33 0-.525-.15-.585-.4-.061-.195-.105-.376-.135-.556-.044-.195-.104-.479-.164-.57-1.87-.283-2.904-.702-3.144-1.271-.03-.076-.046-.15-.046-.225-.015-.24.166-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.044-.242-.09-.346-.119-.825-.329-1.228-.719-1.228-1.168 0-.36.284-.689.735-.838.15-.061.328-.09.509-.09.121 0 .3.015.465.104.359.179.715.301.959.301.271 0 .389-.09.445-.119l-.016-.06c-.104-1.627-.225-3.654.3-4.847C7.711 1.069 11.084.793 12.086.793h.12z" /></svg>
                                            Snapchat
                                        </Label>
                                        <Input
                                            placeholder="https://snapchat.com/add/yourstore"
                                            value={socialLinks.snapchat}
                                            onChange={(e) => setSocialLinks(prev => ({ ...prev, snapchat: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>
                                            TikTok
                                        </Label>
                                        <Input
                                            placeholder="https://tiktok.com/@yourstore"
                                            value={socialLinks.tiktok}
                                            onChange={(e) => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Button onClick={handleSave} disabled={isLoading} className="w-full h-14 rounded-2xl bg-black text-white font-black text-lg shadow-xl shadow-black/20 mt-auto">
                    <Save className="mr-2" size={20} />
                    {isLoading ? "Saving..." : "Save & Publish"}
                </Button>
            </div>

            {/* Right Side: Preview */}
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
