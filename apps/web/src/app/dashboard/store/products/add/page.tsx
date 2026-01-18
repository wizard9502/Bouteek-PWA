"use client";

import { useState } from "react";
import {
    ChevronLeft,
    Upload,
    Package,
    Tag,
    Layers,
    Info,
    Plus,
    X,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddProductPage() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        sku: "",
    });

    const [images, setImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `product-images/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setImages([...images, publicUrl]);
            toast.success("Image uploaded!");
        } catch (error: any) {
            toast.error(`Upload error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();

            const { error } = await supabase.from('products').insert({
                merchant_id: merchant?.id,
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                stock_quantity: Number(formData.stock),
                category: formData.category,
                sku: formData.sku,
                image_url: images[0] || null
            });

            if (error) throw error;
            toast.success(language === 'fr' ? "Produit ajouté !" : "Product added!");
            router.push("/dashboard/store");
        } catch (error) {
            console.error(error);
            toast.error("Error saving product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link href="/dashboard/store">
                <Button variant="ghost" className="rounded-xl flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft size={16} />
                    {language === 'fr' ? "Retour à l'inventaire" : "Back to Inventory"}
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Nouveau Produit" : "Add New Product"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Créez un nouvel article pour votre boutique." : "Create a new item for your storefront."}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-12 px-6 border-border/50 font-bold" onClick={() => router.back()}>
                        {language === 'fr' ? "Annuler" : "Cancel"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl h-12 px-8 bg-bouteek-green text-black font-black"
                    >
                        {loading ? (language === 'fr' ? "Enregistrement..." : "Saving...") : (language === 'fr' ? "Publier le Produit" : "Publish Product")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8 rounded-3xl border-border/50 space-y-6">
                        <div className="space-y-4">
                            <Label htmlFor="product-name" className="text-xs uppercase font-black tracking-widest text-muted-foreground">
                                {language === 'fr' ? "Nom du Produit" : "Product Name"}
                            </Label>
                            <Input
                                id="product-name"
                                placeholder={language === 'fr' ? "ex: Sac en Cuir Premium" : "e.g. Premium Leather Bag"}
                                className="h-14 rounded-2xl bg-muted/30 text-lg font-bold"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="description" className="text-xs uppercase font-black tracking-widest text-muted-foreground">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder={language === 'fr' ? "Décrivez votre produit en détail..." : "Describe your product in detail..."}
                                className="min-h-[200px] rounded-2xl bg-muted/30 p-6 leading-relaxed"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="p-8 rounded-3xl border-border/50 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <Upload size={18} className="text-bouteek-green" />
                            {language === 'fr' ? "Médias du Produit" : "Product Media"}
                        </h3>

                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border border-border/50 group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-bouteek-green hover:bg-bouteek-green/5 transition-all">
                                <Plus size={24} className="text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{isUploading ? "..." : "Add"}</span>
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </Card>
                </div>

                {/* Right: Pricing & Inventory */}
                <div className="space-y-8">
                    <Card className="p-8 rounded-3xl border-border/50 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <Tag size={18} className="text-bouteek-green" />
                            {language === 'fr' ? "Prix & Stock" : "Pricing & Stock"}
                        </h3>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">{language === 'fr' ? "Prix (XOF)" : "Price (XOF)"}</Label>
                            <Input
                                type="number"
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">{language === 'fr' ? "Quantité en Stock" : "Stock Quantity"}</Label>
                            <Input
                                type="number"
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="p-8 rounded-3xl border-border/50 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <Layers size={18} className="text-bouteek-green" />
                            {language === 'fr' ? "Organisation" : "Organization"}
                        </h3>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Category</Label>
                            <Input
                                className="h-12 rounded-xl bg-muted/30 font-bold"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">SKU / ID</Label>
                            <Input
                                className="h-12 rounded-xl bg-muted/30 font-mono text-xs"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </Card>

                    <div className="bg-bouteek-green/5 p-6 rounded-3xl border border-bouteek-green/20">
                        <div className="flex gap-4">
                            <Info size={20} className="text-bouteek-green shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-foreground">Optimization Tip</p>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                    {language === 'fr'
                                        ? "Les produits avec au moins 3 images de haute qualité vendent 80% mieux au Sénégal."
                                        : "Products with at least 3 high-quality images sell 80% better in Senegal."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
