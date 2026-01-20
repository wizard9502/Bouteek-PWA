"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, X, ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConflictData {
    sectionId: string;
    sectionName: string;
    localValue: any;
    remoteValue: any;
    remoteUser: {
        name: string;
        email: string;
    };
    timestamp: Date;
}

interface ConflictModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Conflict data to display */
    conflict: ConflictData | null;
    /** Called when user chooses to keep their version */
    onKeepMine: () => void;
    /** Called when user chooses to use the other version */
    onUseTheirs: () => void;
    /** Called to close without resolving */
    onClose: () => void;
}

/**
 * Modal for resolving edit conflicts between collaborators.
 * Shows side-by-side comparison of local vs remote changes.
 */
export function ConflictModal({
    isOpen,
    conflict,
    onKeepMine,
    onUseTheirs,
    onClose,
}: ConflictModalProps) {
    const [activeTab, setActiveTab] = useState<"mine" | "theirs">("theirs");

    if (!conflict) return null;

    const formatJson = (data: any): string => {
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    const copyToClipboard = (data: any) => {
        navigator.clipboard.writeText(formatJson(data));
        toast.success("Copied to clipboard");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-background rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b bg-amber-50 flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-amber-100">
                                <AlertTriangle className="text-amber-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-black">Edit Conflict Detected</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    <strong>{conflict.remoteUser.name}</strong> made changes to{" "}
                                    <strong>{conflict.sectionName}</strong> while you were editing.
                                    Choose which version to keep.
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Comparison View */}
                        <div className="flex-1 overflow-hidden">
                            {/* Tabs for mobile */}
                            <div className="md:hidden flex border-b">
                                <button
                                    onClick={() => setActiveTab("mine")}
                                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "mine"
                                            ? "border-b-2 border-blue-500 text-blue-600"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    Your Version
                                </button>
                                <button
                                    onClick={() => setActiveTab("theirs")}
                                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "theirs"
                                            ? "border-b-2 border-purple-500 text-purple-600"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    Their Version
                                </button>
                            </div>

                            {/* Side by side on desktop, tabbed on mobile */}
                            <div className="h-full md:grid md:grid-cols-2 divide-x">
                                {/* My Version */}
                                <div className={`flex flex-col ${activeTab !== "mine" ? "hidden md:flex" : ""}`}>
                                    <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ArrowLeft className="text-blue-600" size={16} />
                                            <span className="font-bold text-sm text-blue-600">Your Version</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(conflict.localValue)}
                                        >
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4">
                                        <pre className="text-xs font-mono bg-muted/50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                            {formatJson(conflict.localValue)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Their Version */}
                                <div className={`flex flex-col ${activeTab !== "theirs" ? "hidden md:flex" : ""}`}>
                                    <div className="p-3 bg-purple-50 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="text-purple-600" size={16} />
                                            <span className="font-bold text-sm text-purple-600">
                                                {conflict.remoteUser.name}'s Version
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(conflict.remoteValue)}
                                        >
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4">
                                        <pre className="text-xs font-mono bg-muted/50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                            {formatJson(conflict.remoteValue)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t bg-muted/30 flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={onKeepMine}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold"
                            >
                                <Check className="mr-2" size={18} />
                                Keep My Version
                            </Button>
                            <Button
                                onClick={onUseTheirs}
                                variant="outline"
                                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold"
                            >
                                <Check className="mr-2" size={18} />
                                Use Their Version
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
