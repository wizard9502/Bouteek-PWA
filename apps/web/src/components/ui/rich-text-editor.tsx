import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

export function RichTextEditor({
    label,
    value,
    onChange,
    placeholder = 'Enter text...',
    rows = 6
}: RichTextEditorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-bold">{label}</Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="rounded-xl resize-none font-medium"
            />
            <p className="text-xs text-muted-foreground">
                {value.length} characters
            </p>
        </div>
    );
}
