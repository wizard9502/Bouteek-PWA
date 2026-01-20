"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Package,
    Palette,
    Ruler,
    Plus,
    X,
    Scale
} from "lucide-react";
import { SaleMetadata, SaleVariant } from "@/lib/listing-schemas";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SaleFieldsProps {
    metadata: SaleMetadata;
    basePrice: number;
    onMetadataChange: <K extends keyof SaleMetadata>(key: K, value: SaleMetadata[K]) => void;
    onBasePriceChange: (price: number) => void;
    errors?: Record<string, string>;
}

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PRESET_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#1e3a5f" },
    { name: "Red", hex: "#DC2626" },
    { name: "Green", hex: "#16A34A" },
    { name: "Beige", hex: "#D4A574" },
];

export function SaleFields({
    metadata,
    basePrice,
    onMetadataChange,
    onBasePriceChange,
    errors,
}: SaleFieldsProps) {
    const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<SaleVariant | null>(null);
    const [variantForm, setVariantForm] = useState<SaleVariant>({
        size: "",
        color: "",
        stock: 0,
        price_adjustment: 0,
    });

    // Add or update variant
    const saveVariant = () => {
        const newVariant: SaleVariant = {
            ...variantForm,
            id: editingVariant?.id || crypto.randomUUID(),
        };

        let updatedVariants: SaleVariant[];
        if (editingVariant) {
            updatedVariants = metadata.variants.map(v =>
                v.id === editingVariant.id ? newVariant : v
            );
        } else {
            updatedVariants = [...metadata.variants, newVariant];
        }

        onMetadataChange("variants", updatedVariants);

        // Update total stock
        const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        onMetadataChange("stock_level", totalStock);

        closeVariantSheet();
    };

    // Remove variant
    const removeVariant = (id: string) => {
        const updatedVariants = metadata.variants.filter(v => v.id !== id);
        onMetadataChange("variants", updatedVariants);

        const totalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        onMetadataChange("stock_level", totalStock);
    };

    // Open variant sheet for editing
    const openEditVariant = (variant: SaleVariant) => {
        setEditingVariant(variant);
        setVariantForm(variant);
        setIsVariantSheetOpen(true);
    };

    // Close and reset
    const closeVariantSheet = () => {
        setIsVariantSheetOpen(false);
        setEditingVariant(null);
        setVariantForm({ size: "", color: "", stock: 0, price_adjustment: 0 });
    };

    return (
        <div className="space-y-6">
            {/* Price & Stock Header */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} className="text-bouteek-green" />
                        Base Price (XOF)
                    </Label>
                    <Input
                        type="number"
                        value={basePrice || ""}
                        onChange={(e) => onBasePriceChange(Number(e.target.value))}
                        placeholder="25000"
                        className="h-14 rounded-2xl bg-muted/30 text-lg font-bold"
                    />
                    {errors?.["base_price"] && (
                        <p className="text-xs text-red-500">{errors["base_price"]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Scale size={14} className="text-bouteek-green" />
                        Weight (grams)
                    </Label>
                    <Input
                        type="number"
                        value={metadata.weight || ""}
                        onChange={(e) => onMetadataChange("weight", Number(e.target.value))}
                        placeholder="500"
                        className="h-14 rounded-2xl bg-muted/30"
                    />
                </div>
            </div>

            {/* Total Stock Display */}
            <div className="p-4 rounded-2xl bg-muted/30 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Stock</span>
                <span className="text-2xl font-black">{metadata.stock_level || 0}</span>
            </div>

            {/* Variants Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Variants (Size, Color)
                    </Label>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 text-xs font-bold"
                        onClick={() => setIsVariantSheetOpen(true)}
                    >
                        <Plus size={14} className="mr-1" /> Add Variant
                    </Button>
                </div>

                {/* Variants Grid */}
                <AnimatePresence mode="popLayout">
                    {metadata.variants.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {metadata.variants.map((variant, index) => (
                                <motion.div
                                    key={variant.id || index}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-4 rounded-2xl bg-muted/30 border border-border/30 relative group"
                                    onClick={() => openEditVariant(variant)}
                                >
                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            variant.id && removeVariant(variant.id);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        {/* Color swatch */}
                                        {variant.color && (
                                            <div
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: variant.color }}
                                            />
                                        )}
                                        <div>
                                            <p className="font-bold text-sm">
                                                {variant.size || "One Size"}
                                                {variant.color && <span className="text-muted-foreground"> • {variant.color}</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Stock: {variant.stock}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 rounded-2xl border-2 border-dashed border-border/50 text-center">
                            <p className="text-sm text-muted-foreground">
                                No variants yet. Add size/color combinations.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Variant Bottom Sheet */}
            <Drawer open={isVariantSheetOpen} onOpenChange={setIsVariantSheetOpen}>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle className="text-lg font-black">
                            {editingVariant ? "Edit Variant" : "Add Variant"}
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pb-4 space-y-6 overflow-y-auto">
                        {/* Size Selection */}
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Ruler size={14} /> Size
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setVariantForm(prev => ({ ...prev, size }))}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                                            variantForm.size === size
                                                ? "bg-bouteek-green text-black"
                                                : "bg-muted/50 hover:bg-muted"
                                        )}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <Input
                                placeholder="Or enter custom size"
                                value={variantForm.size || ""}
                                onChange={(e) => setVariantForm(prev => ({ ...prev, size: e.target.value }))}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Palette size={14} /> Color
                            </Label>
                            <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.hex}
                                        type="button"
                                        onClick={() => setVariantForm(prev => ({ ...prev, color: color.hex }))}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 transition-all",
                                            variantForm.color === color.hex
                                                ? "border-bouteek-green scale-110"
                                                : "border-transparent hover:scale-105"
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <Input
                                placeholder="Or enter color name/hex"
                                value={variantForm.color || ""}
                                onChange={(e) => setVariantForm(prev => ({ ...prev, color: e.target.value }))}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Stock */}
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest">
                                Stock Quantity
                            </Label>
                            <Input
                                type="number"
                                value={variantForm.stock || ""}
                                onChange={(e) => setVariantForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                                placeholder="10"
                                className="h-14 rounded-xl text-lg font-bold"
                            />
                        </div>
                    </div>

                    <DrawerFooter className="border-t">
                        <Button
                            onClick={saveVariant}
                            className="w-full h-14 rounded-2xl bg-bouteek-green text-black font-black"
                        >
                            {editingVariant ? "Update Variant" : "Add Variant"}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
