"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Cloud,
    Eye,
    Loader2,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModuleSelector } from "./ModuleSelector";
import { MediaEngine } from "./MediaEngine";
import { SaleFields } from "./SaleFields";
import { RentalFields } from "./RentalFields";
import { ServiceFields } from "./ServiceFields";
import { useListingEditor } from "@/hooks/useListingEditor";
import { useOfflineDraft } from "@/hooks/useOfflineDraft";
import {
    ModuleType,
    SaleMetadata,
    RentalMetadata,
    ServiceMetadata
} from "@/lib/listing-schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/contexts/TranslationContext";

interface ListingEditorProps {
    listingId?: string;
    onComplete?: () => void;
}

const STEP_TITLES = [
    "steps.type",
    "steps.media",
    "steps.details",
    "steps.review"
];

export function ListingEditor({ listingId, onComplete }: ListingEditorProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);

    const {
        state,
        loading,
        saving,
        errors,
        isDirty,
        currentStep,
        totalSteps,
        isStepValid,
        setModuleType,
        updateField,
        updateMetadata,
        addMediaUrl,
        removeMediaUrl,
        reorderMedia,
        getFieldError,
        save,
        reset,
        nextStep,
        prevStep,
        goToStep,
    } = useListingEditor({
        listingId,
        onSaveSuccess: () => {
            clearDraft();
            onComplete?.();
            router.push('/dashboard/listings');
        },
    });

    const {
        hasDraft,
        restoreDraft,
        clearDraft,
        formatSavedTime,
    } = useOfflineDraft(state, {
        onDraftRestored: (draft) => {
            setModuleType(draft.module_type);
            Object.entries(draft).forEach(([key, value]) => {
                if (key !== 'module_type') {
                    updateField(key as keyof typeof state, value);
                }
            });
            toast.success(t("listings.editor.draft_restored"));
        },
    });

    // Check for draft on mount
    useEffect(() => {
        if (hasDraft && !listingId) {
            setShowDraftPrompt(true);
        }
    }, [hasDraft, listingId]);

    // Handle draft restoration
    const handleRestoreDraft = () => {
        restoreDraft();
        setShowDraftPrompt(false);
    };

    const handleDiscardDraft = () => {
        clearDraft();
        setShowDraftPrompt(false);
    };

    // Handle publish
    const handlePublish = async () => {
        const success = await save();
        if (success) {
            // Haptic feedback handled in hook
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-bouteek-green" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* Draft Prompt */}
            <AnimatePresence>
                {showDraftPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
                    >
                        <div className="flex items-start gap-3">
                            <Cloud className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold text-sm">{t("listings.editor.draft_found")}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("listings.editor.draft_desc")} {formatSavedTime()}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        onClick={handleRestoreDraft}
                                        className="rounded-xl bg-amber-500 text-black font-bold"
                                    >
                                        {t("listings.editor.restore_draft")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleDiscardDraft}
                                        className="rounded-xl"
                                    >
                                        {t("listings.editor.start_fresh")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {STEP_TITLES.map((title, index) => {
                        const stepNum = index + 1;
                        const isActive = currentStep === stepNum;
                        const isCompleted = currentStep > stepNum;

                        return (
                            <button
                                key={title}
                                onClick={() => goToStep(stepNum)}
                                className="flex flex-col items-center gap-2 flex-1"
                                disabled={stepNum > currentStep + 1}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                        isActive && "bg-bouteek-green text-black scale-110",
                                        isCompleted && "bg-bouteek-green/20 text-bouteek-green",
                                        !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? <Check size={18} /> : stepNum}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    isActive ? "text-bouteek-green" : "text-muted-foreground"
                                )}>
                                    {t(`listings.editor.${title}`)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-bouteek-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {currentStep === 1 && (
                        <ModuleSelector
                            value={state.module_type}
                            onChange={setModuleType}
                        />
                    )}

                    {currentStep === 2 && (
                        <MediaEngine
                            videoUrl={state.video_url}
                            mediaUrls={state.media_urls}
                            onVideoUrlChange={(url) => updateField('video_url', url)}
                            onAddMedia={addMediaUrl}
                            onRemoveMedia={removeMediaUrl}
                            onReorderMedia={reorderMedia}
                        />
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            {/* Universal Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest">
                                        {t("listings.editor.title")}
                                    </Label>
                                    <Input
                                        value={state.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        placeholder={t("listings.editor.title_placeholder")}
                                        className="h-14 rounded-2xl bg-muted/30 text-lg font-bold"
                                    />
                                    {getFieldError('title') && (
                                        <p className="text-xs text-red-500">{getFieldError('title')}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest">
                                        {t("listings.editor.description")}
                                    </Label>
                                    <Textarea
                                        value={state.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder={t("listings.editor.description_placeholder")}
                                        className="min-h-[120px] rounded-2xl bg-muted/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest">
                                        {t("listings.editor.category")}
                                    </Label>
                                    <Input
                                        value={state.category}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        placeholder={t("listings.editor.category_placeholder")}
                                        className="h-12 rounded-xl bg-muted/30"
                                    />
                                </div>
                            </div>

                            {/* Module-Specific Fields */}
                            <div className="pt-6 border-t border-border/50">
                                {state.module_type === 'sale' && (
                                    <SaleFields
                                        metadata={state.metadata as SaleMetadata}
                                        basePrice={state.base_price}
                                        onMetadataChange={updateMetadata}
                                        onBasePriceChange={(price) => updateField('base_price', price)}
                                    />
                                )}

                                {state.module_type === 'rental' && (
                                    <RentalFields
                                        metadata={state.metadata as RentalMetadata}
                                        basePrice={state.base_price}
                                        onMetadataChange={updateMetadata}
                                        onBasePriceChange={(price) => updateField('base_price', price)}
                                    />
                                )}

                                {state.module_type === 'service' && (
                                    <ServiceFields
                                        metadata={state.metadata as ServiceMetadata}
                                        basePrice={state.base_price}
                                        storeId={state.store_id}
                                        onMetadataChange={updateMetadata}
                                        onBasePriceChange={(price) => updateField('base_price', price)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black">{t("listings.editor.review_title")}</h2>
                                <p className="text-muted-foreground text-sm">
                                    {t("listings.editor.review_subtitle")}
                                </p>
                            </div>

                            {/* Preview Card */}
                            <div className="rounded-3xl border border-border/50 overflow-hidden">
                                {/* Media Preview */}
                                {state.media_urls.length > 0 && (
                                    <div className="aspect-video bg-muted relative">
                                        <img
                                            src={state.media_urls[0]}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        {state.media_urls.length > 1 && (
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-full text-xs text-white font-bold">
                                                +{state.media_urls.length - 1} {t("listings.editor.more_media")}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-6 space-y-4">
                                    {/* Module Badge */}
                                    <span className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-black uppercase",
                                        state.module_type === 'sale' && "bg-bouteek-green/10 text-bouteek-green",
                                        state.module_type === 'rental' && "bg-indigo-500/10 text-indigo-500",
                                        state.module_type === 'service' && "bg-pink-500/10 text-pink-500"
                                    )}>
                                        {state.module_type}
                                    </span>

                                    <h3 className="text-2xl font-black">{state.title || t("common.untitled")}</h3>

                                    {state.description && (
                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                            {state.description}
                                        </p>
                                    )}

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-bouteek-green">
                                            {state.base_price.toLocaleString()} XOF
                                        </span>
                                        {state.module_type === 'rental' && (
                                            <span className="text-sm text-muted-foreground">
                                                / {(state.metadata as RentalMetadata).rental_unit}
                                            </span>
                                        )}
                                        {state.module_type === 'service' && (
                                            <span className="text-sm text-muted-foreground">
                                                • {(state.metadata as ServiceMetadata).duration_minutes} min
                                            </span>
                                        )}
                                    </div>

                                    {/* Module-specific preview info */}
                                    {state.module_type === 'sale' && (
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Stock: <strong>{(state.metadata as SaleMetadata).stock_level}</strong>
                                            </span>
                                            <span className="text-muted-foreground">
                                                Variants: <strong>{(state.metadata as SaleMetadata).variants.length}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {state.module_type === 'rental' && (
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Deposit: <strong>{(state.metadata as RentalMetadata).deposit_amount.toLocaleString()} XOF</strong>
                                            </span>
                                            {(state.metadata as RentalMetadata).require_id_verification && (
                                                <span className="text-amber-500 font-bold">🪪 {t("common.id_required")}</span>
                                            )}
                                        </div>
                                    )}

                                    {state.module_type === 'service' && (
                                        <div className="flex flex-wrap gap-2">
                                            {((state.metadata as ServiceMetadata).amenities_included || []).map(amenity => (
                                                <span key={amenity} className="px-2 py-0.5 bg-pink-500/10 text-pink-500 rounded-full text-xs font-bold">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => updateField('is_active', !state.is_active)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all text-left",
                                        state.is_active
                                            ? "border-bouteek-green bg-bouteek-green/10"
                                            : "border-border/50"
                                    )}
                                >
                                    <p className="font-bold text-sm">{t("common.active")}</p>
                                    <p className="text-xs text-muted-foreground">{t("store.status_active") || "Visible to customers"}</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateField('is_featured', !state.is_featured)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all text-left",
                                        state.is_featured
                                            ? "border-amber-500 bg-amber-500/10"
                                            : "border-border/50"
                                    )}
                                >
                                    <p className="font-bold text-sm">⭐ {t("common.featured") || "Featured"}</p>
                                    <p className="text-xs text-muted-foreground">{t("store.status_featured") || "Highlight in store"}</p>
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    {currentStep > 1 && (
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="rounded-xl h-12 px-6 font-bold"
                        >
                            <ChevronLeft size={18} className="mr-1" />
                            {t("common.back")}
                        </Button>
                    )}

                    <div className="flex-1" />

                    {/* Draft indicator */}
                    {isDirty && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Cloud size={12} /> {t("listings.editor.draft_saved")}
                        </span>
                    )}

                    {currentStep < totalSteps ? (
                        <Button
                            onClick={nextStep}
                            disabled={!isStepValid}
                            className="rounded-xl h-12 px-8 bg-bouteek-green text-black font-black"
                        >
                            {t("common.next")}
                            <ChevronRight size={18} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            disabled={saving}
                            className="rounded-xl h-12 px-8 bg-bouteek-green text-black font-black"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    {t("listings.editor.publishing")}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} className="mr-2" />
                                    {t("listings.editor.publish_listing")}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
