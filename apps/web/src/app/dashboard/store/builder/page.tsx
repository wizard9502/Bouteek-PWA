"use client";

import { useState, useEffect } from "react";
import { useStoreBuilder } from "@/hooks/useStoreBuilder";
import { Block, BlockType } from "@/lib/blocks/types";
import { BLOCK_REGISTRY, BLOCK_CATEGORIES } from "@/lib/blocks/registry";
import { createBlock } from "@/lib/blocks/defaults";
import { BlockRenderer } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
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
    Image as ImageIcon,
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
    Settings,
    Rocket,
    Globe,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, any> = {
    Megaphone,
    Image: ImageIcon,
    Play,
    Columns3,
    Grid3X3,
    LayoutList,
    MessageSquareQuote,
    GalleryHorizontal,
    Phone,
    PanelBottom,
};

// Sortable Block Item
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
                isDragging ? "opacity-50 shadow-lg border-black z-50 ring-2 ring-black" : "border-gray-200 hover:border-black/50",
                !block.enabled && "opacity-50"
            )}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black touch-none p-1"
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
                className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-md transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

export default function StoreBuilderPage() {
    const {
        storeData,
        isLoading,
        isSaving,
        fetchStoreData,
        saveStore,
        publishStore,
        checkSlug,
        slugAvailable,
        isCheckingSlug
    } = useStoreBuilder();

    const { theme, setTheme } = useTheme();

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [settings, setStoreSettings] = useState<any>({});
    const [slug, setSlug] = useState("");

    // UI States
    const [showPreview, setShowPreview] = useState(false);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<Block | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState("");

    // Initialize local state from hook data
    useEffect(() => {
        fetchStoreData();
    }, [fetchStoreData]);

    useEffect(() => {
        if (storeData) {
            setBlocks(storeData.blocks || DEFAULT_LAYOUT);
            setStoreSettings(storeData.settings || {});
            setSlug(storeData.slug || "");
        }
    }, [storeData]);

    const handleSaveDraft = () => {
        saveStore(blocks, settings, slug);
    };

    const handlePublish = async () => {
        const result = await publishStore(blocks, settings, slug);
        if (result && result.success) {
            setPublishedUrl(`https://${result.slug}.bouteek.shop`);
            setIsSuccessModalOpen(true);
        }
    };

    // Sensor setup for Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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
        toast.success("Block added");
    };

    const updateBlockSettings = (blockId: string, newSettings: any) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId ? { ...block, settings: newSettings } : block
            )
        );
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-sm font-medium text-gray-500">Loading Store Builder...</p>
                </div>
            </div>
        );
    }

    // Preview Mode (Mobile Full Screen)
    if (showPreview) {
        return (
            <div className="h-screen flex flex-col bg-white">
                <div className="flex items-center justify-between p-4 border-b bg-white z-10">
                    <button
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-2 text-sm font-bold"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="flex gap-2">
                        <Button onClick={handleSaveDraft} disabled={isSaving} variant="outline" size="sm">
                            <Save size={16} className="mr-2" />
                            Draft
                        </Button>
                        <Button onClick={handlePublish} disabled={isSaving} size="sm" className="bg-black text-white hover:bg-gray-800">
                            <Rocket size={16} className="mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-100">
                    <BlockRenderer
                        blocks={blocks}
                        storeId={storeData?.merchant_id}
                        storeName={settings.storeName || "My Store"}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
            {/* Left Panel: Controls */}
            <div className="flex-1 lg:w-[420px] lg:flex-none bg-white border-r flex flex-col h-full z-10 shadow-xl">
                {/* Header */}
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black tracking-tight">Store Builder</h1>
                        <div className="lg:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                                <Settings size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-full text-xs font-bold"
                        >
                            <Settings size={14} className="mr-2" />
                            Settings
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(true)}
                            className="lg:hidden w-full text-xs font-bold"
                        >
                            <Eye size={14} className="mr-2" />
                            Preview
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="w-full text-xs font-bold"
                        >
                            <Save size={14} className="mr-2" />
                            Save
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isSaving}
                            size="sm"
                            className="w-full bg-black text-white hover:bg-gray-800 text-xs font-bold hidden lg:flex"
                        >
                            <Rocket size={14} className="mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Scrollable Block List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
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

                    <Button
                        onClick={() => setIsAddSheetOpen(true)}
                        variant="outline"
                        className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-black hover:bg-gray-50 text-gray-500 hover:text-black font-bold"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Section
                    </Button>
                </div>

                {/* Mobile Publish Bottom Bar */}
                <div className="p-4 border-t lg:hidden bg-white">
                    <Button
                        onClick={handlePublish}
                        disabled={isSaving}
                        className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold text-lg shadow-lg shadow-black/20 rounded-xl"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <><Rocket className="mr-2" /> Publish Live</>}
                    </Button>
                </div>
            </div>

            {/* Right Panel: Live Preview (Desktop) */}
            <div className="hidden lg:flex flex-1 bg-gray-100 items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 pattern-grid-lg opacity-5 pointer-events-none" />

                {/* Phone Frame */}
                <div className="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 relative overflow-hidden flex flex-col">
                    {/* Dynamic Island / Notch */}
                    <div className="absolute top-0 inset-x-0 h-7 bg-gray-900 z-50 flex justify-center">
                        <div className="w-32 h-5 bg-black rounded-b-xl" />
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
                        <BlockRenderer
                            blocks={blocks}
                            storeId={storeData?.merchant_id}
                            storeName={settings.storeName || "My Store"}
                        />
                    </div>
                </div>
            </div>

            {/* --- MODALS & SHEETS --- */}

            {/* 1. Store Settings Sheet */}
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-black">Store Settings</SheetTitle>
                        <SheetDescription>Configuring your store identity and appearance.</SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-8">
                        {/* Slug Section */}
                        <div className="space-y-3">
                            <Label className="font-bold text-base">Store URL</Label>
                            <div className="relative">
                                <Input
                                    value={slug}
                                    onChange={(e) => {
                                        const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        setSlug(cleanSlug);
                                        checkSlug(cleanSlug);
                                    }}
                                    className={cn(
                                        "pl-3 pr-10 font-mono",
                                        slugAvailable === true && "border-green-500 focus-visible:ring-green-500",
                                        slugAvailable === false && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    placeholder="my-cool-store"
                                />
                                <div className="absolute right-3 top-2.5">
                                    {isCheckingSlug ? <Loader2 size={16} className="animate-spin text-gray-400" /> :
                                        slugAvailable === true ? <CheckCircle2 size={16} className="text-green-500" /> :
                                            slugAvailable === false ? <X size={16} className="text-red-500" /> : null}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <Globe size={12} className="mr-1" />
                                {slug ? `${slug}.bouteek.shop` : "your-name.bouteek.shop"}
                            </p>
                            {slugAvailable === false && <p className="text-xs text-red-500 font-medium">⚠️ This URL is already taken.</p>}
                        </div>

                        {/* Branding Section */}
                        <div className="space-y-3">
                            <Label className="font-bold text-base">Branding</Label>
                            <div className="grid gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Store Name</Label>
                                    <Input
                                        value={settings.storeName || ""}
                                        onChange={(e) => setStoreSettings({ ...settings, storeName: e.target.value })}
                                        placeholder="e.g. Snipe Dakar"
                                    />
                                </div>
                                <ImageUpload
                                    label="Store Logo"
                                    currentImage={settings.logo}
                                    onImageChange={(url) => setStoreSettings({ ...settings, logo: url })}
                                />
                            </div>
                        </div>

                        {/* Theme Section */}
                        <div className="space-y-3">
                            <Label className="font-bold text-base">Color Theme</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'light', color: 'bg-white border-gray-200' },
                                    { id: 'dark', color: 'bg-zinc-900 border-zinc-800' },
                                    { id: 'pink', color: 'bg-pink-500 border-pink-600' },
                                    { id: 'purple', color: 'bg-purple-600 border-purple-700' },
                                    { id: 'ocean', color: 'bg-blue-500 border-blue-600' },
                                    { id: 'sunset', color: 'bg-orange-500 border-orange-600' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "h-12 rounded-lg border-2 transition-all",
                                            t.color,
                                            theme === t.id ? "ring-2 ring-offset-2 ring-black scale-105" : "hover:scale-105"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button onClick={() => {
                            handleSaveDraft();
                            setIsSettingsOpen(false);
                        }} className="w-full h-12 rounded-xl bg-black text-white hover:bg-gray-800 font-bold">
                            Save Settings
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* 2. Add Block Sheet */}
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                <SheetContent side="bottom" className="h-[75vh] rounded-t-[2rem]">
                    <SheetHeader>
                        <SheetTitle>Add Section</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto py-6 space-y-6 pb-20">
                        {BLOCK_CATEGORIES.map((category) => (
                            <div key={category.id}>
                                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                                    {category.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.values(BLOCK_REGISTRY)
                                        .filter((block) => block.category === category.id)
                                        .map((block) => {
                                            const IconComponent = ICON_MAP[block.icon] || Grid3X3;
                                            return (
                                                <button
                                                    key={block.type}
                                                    onClick={() => addBlock(block.type)}
                                                    className="flex flex-col items-center gap-3 p-4 border rounded-xl hover:border-black hover:bg-gray-50 transition-all text-center group"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
                                                        <IconComponent size={20} className="text-gray-600 group-hover:text-black" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{block.name}</span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>

            {/* 3. Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <DialogTitle className="text-center flex flex-col items-center gap-4 pt-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 size={32} className="text-green-600" />
                            </div>
                            <span className="text-2xl font-black">You're Live!</span>
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg">
                            Your store has been successfully published to the world.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 my-4">
                        <p className="font-mono text-sm text-center select-all break-all cursor-pointer hover:text-blue-600" onClick={() => {
                            navigator.clipboard.writeText(publishedUrl);
                            toast.success("Copied to clipboard!");
                        }}>
                            {publishedUrl}
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:gap-0">
                        <Button
                            className="w-full bg-black text-white hover:bg-gray-800 font-bold h-12 rounded-xl"
                            onClick={() => window.open(publishedUrl, '_blank')}
                        >
                            Visit Store
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="mt-2"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 4. Edit Block Sheet */}
            {editingBlock && (
                <Sheet open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-[2rem]">
                        <SheetHeader>
                            <SheetTitle>Edit {BLOCK_REGISTRY[editingBlock.type].name}</SheetTitle>
                        </SheetHeader>
                        <div className="overflow-y-auto py-6 pb-20">
                            <BlockSettingsForm
                                block={editingBlock}
                                onSave={(s) => {
                                    updateBlockSettings(editingBlock.id, s);
                                    setEditingBlock(null);
                                    toast.success("Updated");
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            )}

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

    // Simple generic inputs for now, can be expanded to specific block types
    const renderFields = () => {
        // Fallback to generic if no specific case
        // But we can keep the switch from the original file if we want specific tailored inputs
        // For brevity in this fix, I'll use a smart generic generator + the original cases if I remember them. 
        // Actually, let's restore the switch from the previous file content I saw to ensure quality.

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
                                <div className="flex gap-2">
                                    <Input type="color" value={(settings as any).bgColor} onChange={(e) => updateSetting("bgColor", e.target.value)} className="w-12 h-12 p-1" />
                                    <Input value={(settings as any).bgColor} onChange={(e) => updateSetting("bgColor", e.target.value)} className="flex-1" />
                                </div>
                            </div>
                            <div>
                                <Label>Text Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={(settings as any).textColor} onChange={(e) => updateSetting("textColor", e.target.value)} className="w-12 h-12 p-1" />
                                    <Input value={(settings as any).textColor} onChange={(e) => updateSetting("textColor", e.target.value)} className="flex-1" />
                                </div>
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
                            <Input value={(settings as any).headline} onChange={(e) => updateSetting("headline", e.target.value)} />
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Input value={(settings as any).subtitle} onChange={(e) => updateSetting("subtitle", e.target.value)} />
                        </div>
                        <div>
                            <Label>Button Text</Label>
                            <Input value={(settings as any).buttonText} onChange={(e) => updateSetting("buttonText", e.target.value)} />
                        </div>
                    </div>
                );
            case "video_loop":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label>Video URL (MP4)</Label>
                            <Input value={(settings as any).videoUrl} onChange={(e) => updateSetting("videoUrl", e.target.value)} placeholder="https://..." />
                        </div>
                        <ImageUpload label="Poster Image" currentImage={(settings as any).posterImage} onImageChange={(url) => updateSetting("posterImage", url)} />
                        <div className="flex items-center gap-3 p-3 border rounded-xl">
                            <Switch checked={(settings as any).autoplay} onCheckedChange={(c) => updateSetting("autoplay", c)} />
                            <Label>Autoplay</Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-xl">
                            <Switch checked={(settings as any).muted} onCheckedChange={(c) => updateSetting("muted", c)} />
                            <Label>Muted</Label>
                        </div>
                    </div>
                );
            case "contact_block":
                return (
                    <div className="space-y-4">
                        <div><Label>WhatsApp</Label><Input value={(settings as any).whatsapp} onChange={(e) => updateSetting("whatsapp", e.target.value)} /></div>
                        <div><Label>Phone</Label><Input value={(settings as any).phone} onChange={(e) => updateSetting("phone", e.target.value)} /></div>
                        <div><Label>Email</Label><Input value={(settings as any).email} onChange={(e) => updateSetting("email", e.target.value)} /></div>
                        <div className="flex items-center gap-3"><Switch checked={(settings as any).showFloatingButton} onCheckedChange={(c) => updateSetting("showFloatingButton", c)} /><Label>Floating WhatsApp</Label></div>
                    </div>
                );
            case "footer":
                return (
                    <div className="space-y-4">
                        <div><Label>Tagline</Label><Input value={(settings as any).tagline} onChange={(e) => updateSetting("tagline", e.target.value)} /></div>
                        <div><Label>Address</Label><Input value={(settings as any).address} onChange={(e) => updateSetting("address", e.target.value)} /></div>
                        <div><Label>Copyright</Label><Input value={(settings as any).copyrightText} onChange={(e) => updateSetting("copyrightText", e.target.value)} /></div>
                    </div>
                );
            // Default fallthrough for others or if I missed exact fields, 
            // providing a generic input for existing keys in settings object
            default:
                return (
                    <div className="space-y-4">
                        {Object.keys(settings).map((key) => {
                            if (typeof settings[key] === 'string' && (key.includes('Image') || key.includes('logo'))) {
                                return <ImageUpload key={key} label={key} currentImage={settings[key]} onImageChange={(url) => updateSetting(key, url)} />;
                            }
                            if (typeof settings[key] === 'string' && !key.includes('color')) {
                                return <div key={key}><Label className="capitalize">{key}</Label><Input value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} /></div>;
                            }
                            if (typeof settings[key] === 'boolean') {
                                return <div key={key} className="flex items-center gap-3"><Switch checked={settings[key]} onCheckedChange={(c) => updateSetting(key, c)} /><Label className="capitalize">{key}</Label></div>;
                            }
                            return null;
                        })}
                        {Object.keys(settings).length === 0 && <p className="text-gray-500 text-sm">No specific settings for this block.</p>}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">{renderFields()}</div>
            <Button onClick={() => onSave(settings)} className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-bold">
                Save Changes
            </Button>
        </div>
    );
}
