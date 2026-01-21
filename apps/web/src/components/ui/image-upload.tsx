import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface ImageUploadProps {
    label: string;
    currentImage?: string;
    onImageChange: (url: string) => void;
    aspectRatio?: string;
    maxSizeMB?: number;
}

export function ImageUpload({
    label,
    currentImage,
    onImageChange,
    aspectRatio = 'aspect-video',
    maxSizeMB = 5
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setUploading(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `store-assets/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('public-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onImageChange(publicUrl);
            toast.success('Image uploaded successfully!');

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onImageChange('');
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-bold">{label}</Label>

            {preview ? (
                <div className="relative group">
                    <div className={`${aspectRatio} w-full rounded-2xl overflow-hidden bg-muted border-2 border-border/50`}>
                        <img
                            src={preview}
                            alt={label}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemove}
                    >
                        <X size={16} />
                    </Button>
                </div>
            ) : (
                <label className={`${aspectRatio} w-full rounded-2xl border-2 border-dashed border-border/50 hover:border-bouteek-green transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50`}>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bouteek-green" />
                    ) : (
                        <>
                            <ImageIcon size={32} className="text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-bold">Click to upload</p>
                                <p className="text-xs text-muted-foreground">Max {maxSizeMB}MB</p>
                            </div>
                        </>
                    )}
                </label>
            )}
        </div>
    );
}
