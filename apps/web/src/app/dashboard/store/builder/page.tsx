"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Block, BlockType } from "@/lib/blocks/types";
import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from "@/lib/blocks/registry";
import { createBlock, DEFAULT_LAYOUT } from "@/lib/blocks/defaults";
import { BlockRenderer } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { useTheme } from "next-themes";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Plus,
    Trash2,
    Save,
    Eye,
    ArrowLeft,
    Megaphone,
    Image,
    Play,
    Columns3,
    Grid3X3,
    LayoutList,
    MessageSquareQuote,
    GalleryHorizontal,
    Phone,
    PanelBottom,
    X,
    Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, any> = {
    Megaphone,
    Image,
    Play,
    Columns3,
    Grid3X3,
    LayoutList,
    MessageSquareQuote,
    GalleryHorizontal,
    Phone,
    PanelBottom,
};

// Sortable Block Item - Click anywhere to edit
function SortableBlockItem({
    block,
    onToggle,
    onClick,
    onDelete,
}: {
    block: Block;
    onToggle: (e: React.MouseEvent) => void;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const meta = BLOCK_REGISTRY[block.type];
    const IconComponent = ICON_MAP[meta.icon] || Grid3X3;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer transition-all",
                isDragging ? "opacity-50 shadow-lg border-black" : "border-gray-200 hover:border-gray-400",
                !block.enabled && "opacity-50"
            )}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            >
                <GripVertical size={18} />
            </button>

            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <IconComponent size={16} className="text-gray-600" />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{meta.name}</h4>
            </div>

            {/* Toggle */}
            <Switch
                checked={block.enabled}
                onCheckedChange={() => { }}
                onClick={onToggle}
            />

            {/* Delete */}
            <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 p-1"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

export default function StoreBuilderPage() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [storeName, setStoreName] = useState("");
    const { theme, setTheme } = useTheme();

    // UI States
    const [showPreview, setShowPreview] = useState(false);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isBrandingOpen, setIsBrandingOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<Block | null>(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadStoreData();
    }, []);

    const loadStoreData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase
                .from("merchants")
                .select("id, business_name")
                .eq("user_id", user.id)
                .single();

            if (!merchant) return;

            setMerchantId(merchant.id);
            setStoreName(merchant.business_name || "");

            const { data: storefront } = await supabase
                .from("storefronts")
                .select("layout_blocks")
                .eq("merchant_id", merchant.id)
                .single();

            if (storefront?.layout_blocks?.length > 0) {
                setBlocks(storefront.layout_blocks);
            } else {
                setBlocks(DEFAULT_LAYOUT);
            }
        } catch (error) {
            console.error("Error loading:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!merchantId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("storefronts")
                .upsert({
                    merchant_id: merchantId,
                    layout_blocks: blocks,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "merchant_id" });

            if (error) throw error;
            toast.success("Saved!");
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleBlock = (blockId: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId ? { ...block, enabled: !block.enabled } : block
            )
        );
    };

    const deleteBlock = (blockId: string) => {
        setBlocks((prev) => prev.filter((block) => block.id !== blockId));
        toast.success("Block removed");
    };

    const addBlock = (type: BlockType) => {
        const newBlock = createBlock(type);
        setBlocks((prev) => [...prev, newBlock]);
        setIsAddSheetOpen(false);
        toast.success(`Added ${BLOCK_REGISTRY[type].name}`);
    };

    const updateBlockSettings = (blockId: string, settings: any) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId ? { ...block, settings } : block
            )
        );
        setEditingBlock(null);
        toast.success("Updated!");
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    // Mobile Preview View
    if (showPreview) {
        return (
            <div className="h-screen flex flex-col bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <button
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-2 text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Editor
                    </button>
                    <Button onClick={handleSave} disabled={isSaving} size="sm">
                        <Save size={16} className="mr-1" />
                        {isSaving ? "..." : "Save"}
                    </Button>
                </div>
                {/* Full Preview */}
                <div className="flex-1 overflow-y-auto">
                    <BlockRenderer
                        blocks={blocks}
                        storeId={merchantId || undefined}
                        storeName={storeName}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
            {/* Left Panel - Block List (Full width on mobile, fixed width on desktop) */}
            <div className="flex-1 lg:w-[400px] lg:flex-none bg-white border-r flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">Store Builder</h1>
                        <div className="flex items-center gap-2">
                            {/* Preview Button (Mobile only) */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPreview(true)}
                                className="lg:hidden"
                            >
                                <Eye size={16} className="mr-1" />
                                Preview
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsBrandingOpen(true)}
                            >
                                <Palette size={16} className="mr-1" />
                                Branding
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} size="sm">
                                <Save size={16} className="mr-1" />
                                {isSaving ? "..." : "Save"}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Tap a block to edit • Drag to reorder
                    </p>
                </div>

                {/* Block List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map((b) => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {blocks.map((block) => (
                                <SortableBlockItem
                                    key={block.id}
                                    block={block}
                                    onToggle={(e) => {
                                        e.stopPropagation();
                                        toggleBlock(block.id);
                                    }}
                                    onClick={() => setEditingBlock(block)}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        deleteBlock(block.id);
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {/* Add Block Button */}
                    <button
                        onClick={() => setIsAddSheetOpen(true)}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add Block
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview (Desktop only) */}
            <div className="hidden lg:flex flex-1 bg-white overflow-hidden shadow-inner">
                <div className="w-full h-full overflow-y-auto preview-container">
                    <BlockRenderer
                        blocks={blocks}
                        storeId={merchantId || undefined}
                        storeName={storeName}
                    />
                </div>
            </div>

            {/* Add Block Sheet */}
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>Add Block</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto py-4 space-y-6">
                        {BLOCK_CATEGORIES.map((category) => (
                            <div key={category.id}>
                                <h3 className="font-bold text-xs text-gray-500 uppercase mb-2">
                                    {category.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(BLOCK_REGISTRY)
                                        .filter((block) => block.category === category.id)
                                        .map((block) => {
                                            const IconComponent = ICON_MAP[block.icon] || Grid3X3;
                                            return (
                                                <button
                                                    key={block.type}
                                                    onClick={() => addBlock(block.type)}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-black transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <IconComponent size={18} />
                                                    </div>
                                                    <span className="font-medium text-sm">{block.name}</span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Branding & Themes Sheet */}
            <Sheet open={isBrandingOpen} onOpenChange={setIsBrandingOpen}>
                <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>Store Branding & Themes</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 space-y-8">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Store Theme</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'light', name: 'Light', color: 'bg-white', border: 'border-border' },
                                    { id: 'dark', name: 'Dark', color: 'bg-zinc-900', border: 'border-zinc-800' },
                                    { id: 'pink', name: 'Bouteek Pink', color: 'bg-pink-500', border: 'border-pink-200' },
                                    { id: 'purple', name: 'Royal', color: 'bg-purple-600', border: 'border-purple-200' },
                                    { id: 'ocean', name: 'Ocean', color: 'bg-blue-500', border: 'border-blue-200' },
                                    { id: 'luxury', name: 'Midnight', color: 'bg-zinc-950', border: 'border-amber-500' },
                                    { id: 'sunset', name: 'Sunset', color: 'bg-orange-500', border: 'border-orange-200' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200",
                                            theme === t.id ? "border-black bg-gray-50 scale-105 shadow-sm" : "border-transparent hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full border shadow-inner flex items-center justify-center", t.color, t.border)}>
                                            {theme === t.id && (
                                                <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={() => setIsBrandingOpen(false)} className="w-full h-12 rounded-xl">
                            Done
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Block Sheet */}
            <Sheet open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                    <SheetHeader>
                        <SheetTitle>
                            Edit {editingBlock && BLOCK_REGISTRY[editingBlock.type].name}
                        </SheetTitle>
                    </SheetHeader>
                    {editingBlock && (
                        <BlockSettingsForm
                            block={editingBlock}
                            onSave={(settings) => updateBlockSettings(editingBlock.id, settings)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

// Block Settings Form
function BlockSettingsForm({
    block,
    onSave,
}: {
    block: Block;
    onSave: (settings: any) => void;
}) {
    const [settings, setSettings] = useState(block.settings);

    const updateSetting = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const renderFields = () => {
        switch (block.type) {
            case "announcement_bar":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Text</Label>
                            <Input
                                value={(settings as any).text}
                                onChange={(e) => updateSetting("text", e.target.value)}
                                placeholder="Your announcement..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Background</Label>
                                <Input
                                    type="color"
                                    value={(settings as any).bgColor}
                                    onChange={(e) => updateSetting("bgColor", e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div>
                                <Label>Text Color</Label>
                                <Input
                                    type="color"
                                    value={(settings as any).textColor}
                                    onChange={(e) => updateSetting("textColor", e.target.value)}
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </div>
                );

            case "hero":
                return (
                    <div className="space-y-4">
                        <ImageUpload
                            label="Background Image"
                            currentImage={(settings as any).backgroundImage}
                            onImageChange={(url) => updateSetting("backgroundImage", url)}
                        />
                        <div>
                            <Label>Headline</Label>
                            <Input
                                value={(settings as any).headline}
                                onChange={(e) => updateSetting("headline", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Input
                                value={(settings as any).subtitle}
                                onChange={(e) => updateSetting("subtitle", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Button Text</Label>
                            <Input
                                value={(settings as any).buttonText}
                                onChange={(e) => updateSetting("buttonText", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "video_loop":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Video URL (MP4)</Label>
                            <Input
                                value={(settings as any).videoUrl}
                                onChange={(e) => updateSetting("videoUrl", e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <ImageUpload
                            label="Poster Image"
                            currentImage={(settings as any).posterImage}
                            onImageChange={(url) => updateSetting("posterImage", url)}
                        />
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={(settings as any).autoplay}
                                onCheckedChange={(checked) => updateSetting("autoplay", checked)}
                            />
                            <Label>Autoplay</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={(settings as any).muted}
                                onCheckedChange={(checked) => updateSetting("muted", checked)}
                            />
                            <Label>Muted</Label>
                        </div>
                    </div>
                );

            case "multi_column_features":
                return (
                    <div className="space-y-4">
                        <Label>Features</Label>
                        {(settings as any).columns.map((col: any, idx: number) => (
                            <div key={idx} className="p-4 border rounded-xl space-y-2">
                                <Input
                                    placeholder="Title"
                                    value={col.title}
                                    onChange={(e) => {
                                        const newCols = [...(settings as any).columns];
                                        newCols[idx] = { ...col, title: e.target.value };
                                        updateSetting("columns", newCols);
                                    }}
                                />
                                <Input
                                    placeholder="Description"
                                    value={col.description}
                                    onChange={(e) => {
                                        const newCols = [...(settings as any).columns];
                                        newCols[idx] = { ...col, description: e.target.value };
                                        updateSetting("columns", newCols);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                );

            case "category_slider":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Section Title</Label>
                            <Input
                                value={(settings as any).title}
                                onChange={(e) => updateSetting("title", e.target.value)}
                            />
                        </div>
                        <p className="text-sm text-gray-500">Categories are pulled from your products automatically.</p>
                    </div>
                );

            case "gallery":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Section Title</Label>
                            <Input
                                value={(settings as any).title}
                                onChange={(e) => updateSetting("title", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Columns</Label>
                            <select
                                value={(settings as any).columns}
                                onChange={(e) => updateSetting("columns", Number(e.target.value))}
                                className="w-full p-3 border rounded-xl bg-background"
                            >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Gallery Images</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(settings as any).images.map((img: string, idx: number) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                const newImgs = (settings as any).images.filter((_: any, i: number) => i !== idx);
                                                updateSetting("images", newImgs);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <ImageUpload
                                label="Add Gallery Image"
                                onImageChange={(url) => {
                                    if (url) {
                                        updateSetting("images", [...(settings as any).images, url]);
                                    }
                                }}
                            />
                        </div>
                    </div>
                );

            case "featured_grid":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Section Title</Label>
                            <Input
                                value={(settings as any).title}
                                onChange={(e) => updateSetting("title", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Columns</Label>
                            <select
                                value={(settings as any).columns}
                                onChange={(e) => updateSetting("columns", Number(e.target.value))}
                                className="w-full p-3 border rounded-xl"
                            >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                            </select>
                        </div>
                    </div>
                );

            case "contact_block":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>WhatsApp</Label>
                            <Input
                                value={(settings as any).whatsapp}
                                onChange={(e) => updateSetting("whatsapp", e.target.value)}
                                placeholder="+221..."
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={(settings as any).phone}
                                onChange={(e) => updateSetting("phone", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                value={(settings as any).email}
                                onChange={(e) => updateSetting("email", e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={(settings as any).showFloatingButton}
                                onCheckedChange={(checked) => updateSetting("showFloatingButton", checked)}
                            />
                            <Label>Floating WhatsApp Button</Label>
                        </div>
                    </div>
                );

            case "footer":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Tagline</Label>
                            <Input
                                value={(settings as any).tagline}
                                onChange={(e) => updateSetting("tagline", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input
                                value={(settings as any).address}
                                onChange={(e) => updateSetting("address", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Copyright</Label>
                            <Input
                                value={(settings as any).copyrightText}
                                onChange={(e) => updateSetting("copyrightText", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "testimonial_slider":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Section Title</Label>
                            <Input
                                value={(settings as any).title}
                                onChange={(e) => updateSetting("title", e.target.value)}
                            />
                        </div>
                        <p className="text-sm text-gray-500">
                            Testimonials can be managed in your dashboard.
                        </p>
                    </div>
                );

            default:
                return (
                    <p className="text-gray-500 text-sm py-4">
                        Settings for this block type coming soon.
                    </p>
                );
        }
    };

    return (
        <div className="py-4 space-y-6 overflow-y-auto">
            {renderFields()}
            <Button onClick={() => onSave(settings)} className="w-full h-12 rounded-xl">
                Save Changes
            </Button>
        </div>
    );
}
