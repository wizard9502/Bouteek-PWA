"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Video,
    Image as ImageIcon,
    Upload,
    X,
    GripVertical,
    Play,
    Loader2,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaEngineProps {
    videoUrl: string;
    mediaUrls: string[];
    onVideoUrlChange: (url: string) => void;
    onAddMedia: (url: string) => void;
    onRemoveMedia: (index: number) => void;
    onReorderMedia?: (from: number, to: number) => void;
    maxImages?: number;
}

export function MediaEngine({
    videoUrl,
    mediaUrls,
    onVideoUrlChange,
    onAddMedia,
    onRemoveMedia,
    onReorderMedia,
    maxImages = 10,
}: MediaEngineProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoValid, setVideoValid] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Validate video URL (YouTube or MP4)
    const validateVideoUrl = useCallback((url: string) => {
        if (!url) {
            setVideoValid(null);
            return;
        }

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const mp4Regex = /\.(mp4|webm|mov)(\?.*)?$/i;

        const isValid = youtubeRegex.test(url) || mp4Regex.test(url);
        setVideoValid(isValid);
    }, []);

    // Get YouTube embed URL
    const getYouTubeEmbedUrl = (url: string): string | null => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return null;
    };

    // Handle file upload with compression
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - mediaUrls.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        if (filesToUpload.length < files.length) {
            toast.warning(`Only ${remainingSlots} more images can be added`);
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];

                // Compress image using Canvas API (Dakar/Senegal bandwidth optimization)
                const compressedFile = await compressImage(file, 0.7, 1200);

                const fileExt = compressedFile.name.split('.').pop() || 'jpg';
                const fileName = `${crypto.randomUUID()}_${Date.now()}.${fileExt}`;
                const filePath = `listing-images/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                onAddMedia(publicUrl);
                setUploadProgress(((i + 1) / filesToUpload.length) * 100);
            }

            toast.success(`${filesToUpload.length} image(s) uploaded!`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index && onReorderMedia) {
            onReorderMedia(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">Add Media</h2>
                <p className="text-muted-foreground text-sm">
                    Video first, then add up to {maxImages} images
                </p>
            </div>

            {/* Video URL Input */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Video size={18} className="text-bouteek-green" />
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Video URL (YouTube or MP4)
                    </Label>
                    {videoValid === true && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
                            <Check size={12} /> Valid
                        </span>
                    )}
                    {videoValid === false && (
                        <span className="ml-auto text-xs text-red-500">Invalid URL</span>
                    )}
                </div>
                <Input
                    placeholder="https://youtube.com/watch?v=... or https://...mp4"
                    value={videoUrl}
                    onChange={(e) => {
                        onVideoUrlChange(e.target.value);
                        validateVideoUrl(e.target.value);
                    }}
                    className="h-14 rounded-2xl bg-muted/30 font-mono text-sm"
                />

                {/* Video Preview */}
                <AnimatePresence>
                    {videoUrl && videoValid && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="aspect-video rounded-2xl overflow-hidden bg-black relative">
                                {youtubeEmbedUrl ? (
                                    <iframe
                                        src={youtubeEmbedUrl}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-bouteek-green" />
                    <Label className="text-xs font-black uppercase tracking-widest">
                        Product Images ({mediaUrls.length}/{maxImages})
                    </Label>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Uploaded Images */}
                    {mediaUrls.map((url, index) => (
                        <motion.div
                            key={url}
                            layout
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "aspect-square rounded-2xl overflow-hidden relative group cursor-grab active:cursor-grabbing",
                                draggedIndex === index && "opacity-50"
                            )}
                        >
                            <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => onRemoveMedia(index)}
                                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Drag handle indicator */}
                            <div className="absolute top-2 left-2 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={12} />
                            </div>

                            {/* Primary badge */}
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-bouteek-green text-black text-[10px] font-black rounded-full uppercase">
                                    Main
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Upload Button */}
                    {mediaUrls.length < maxImages && (
                        <label
                            className={cn(
                                "aspect-square rounded-2xl border-2 border-dashed border-border/50",
                                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                                "hover:border-bouteek-green hover:bg-bouteek-green/5 transition-all",
                                isUploading && "pointer-events-none opacity-50"
                            )}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin text-bouteek-green" />
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {Math.round(uploadProgress)}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload size={24} className="text-muted-foreground" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Add
                                    </span>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                        </label>
                    )}
                </div>

                {/* Upload progress bar */}
                {isUploading && (
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full bg-bouteek-green"
                        />
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="p-4 bg-bouteek-green/5 rounded-2xl border border-bouteek-green/20">
                <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">💡 Tip:</span> Images are auto-compressed for faster loading in Senegal.
                    Drag to reorder — first image is the main one.
                </p>
            </div>
        </div>
    );
}
