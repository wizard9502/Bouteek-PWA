"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, ScanFace, Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function VerificationPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [merchantId, setMerchantId] = useState<string | null>(null);

    // Form State
    const [idType, setIdType] = useState<"passport" | "national_id" | "">("");
    const [ninea, setNinea] = useState("");
    const [rccm, setRccm] = useState("");
    const [idFront, setIdFront] = useState("");
    const [idBack, setIdBack] = useState("");
    const [selfie, setSelfie] = useState("");

    const [submissionStatus, setSubmissionStatus] = useState<any>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: merchant } = await supabase.from('merchants').select('id, is_verified').eq('user_id', user.id).single();
            if (merchant) {
                setMerchantId(merchant.id);
                // Check if already submitted
                const { data: submission } = await supabase
                    .from('kyc_submissions')
                    .select('*')
                    .eq('merchant_id', merchant.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (submission) {
                    setStatus(submission.status);
                    setSubmissionStatus(submission);
                    if (submission.status === 'rejected') {
                        // Prefill for retry
                        setNinea(submission.ninea || "");
                        setRccm(submission.rccm || "");
                    }
                } else if (merchant.is_verified) {
                    setStatus('approved'); // Legacy verified
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!merchantId) return;
        if (!idType || !idFront || !selfie) {
            toast.error("Please complete all required fields");
            return;
        }
        if (idType === 'national_id' && !idBack) {
            toast.error("National ID requires both Front and Back images");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('kyc_submissions').insert({
                merchant_id: merchantId,
                id_type: idType,
                id_document_front_url: idFront,
                id_document_back_url: idBack || null,
                selfie_url: selfie,
                ninea: ninea || null,
                rccm: rccm || null,
                status: 'pending'
            });

            if (error) throw error;

            toast.success("Verification submitted successfully!");
            setStatus('pending');
            window.scrollTo(0, 0);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to submit verification: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    if (status === 'approved') {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-bouteek-green/10 rounded-full flex items-center justify-center mx-auto text-bouteek-green mb-6">
                    <ShieldCheck size={48} />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tight">You are Verified!</h1>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                    Your store is fully verified and online. You have full access to all features.
                </p>
                <div className="bg-muted p-4 rounded-2xl inline-block">
                    <p className="text-xs font-mono font-bold uppercase">Merchant ID: {merchantId?.split('-')[0]}...</p>
                </div>
                <div className="pt-6">
                    <Button onClick={() => router.push('/dashboard')} className="rounded-2xl font-black bg-black text-white hover:bg-bouteek-green hover:text-black">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-6">
                    <Loader2 size={48} className="animate-spin" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Verification In Review</h1>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                    Our team is currently reviewing your documents. This usually takes 24-48 hours.
                </p>
                <Alert className="max-w-md mx-auto text-left bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 font-bold">Store Status: Pending</AlertTitle>
                    <AlertDescription className="text-amber-700 text-xs">
                        Your store will remain offline until verification is complete.
                    </AlertDescription>
                </Alert>
                <div className="pt-6">
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="rounded-2xl font-bold">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-20">
            <div>
                <h1 className="hero-text !text-4xl text-left">Identity Verification</h1>
                <p className="text-muted-foreground font-medium mt-2">
                    To ensure trust and safety standard, we require all merchants to verify their identity.
                </p>
            </div>

            {status === 'rejected' && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 font-bold">Verification Rejected</AlertTitle>
                    <AlertDescription className="text-red-700 text-xs mt-1">
                        Your previous submission was rejected. Please review the requirements and try again.
                        {/* REASON FEEDBACK */}
                        <div className="mt-2 p-2 bg-white/50 rounded-lg border border-red-100 font-medium italic">
                            "{(status === 'rejected' && (submissionStatus as any)?.admin_notes) || "Reason not specified. Please check document clarity."}"
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Step 1: Legal Info */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">1</div>
                        <h3 className="text-xl font-black tracking-tight">Business Registration</h3>
                    </div>
                    <Card className="rounded-3xl border-border/50">
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NINEA (Optional)</Label>
                                    <Input
                                        placeholder="000000000"
                                        className="h-12 rounded-xl bg-muted/30 font-mono"
                                        value={ninea}
                                        onChange={e => setNinea(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">RCCM (Optional)</Label>
                                    <Input
                                        placeholder="SN-DKR-202X-..."
                                        className="h-12 rounded-xl bg-muted/30 font-mono"
                                        value={rccm}
                                        onChange={e => setRccm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium">
                                *Providing NINEA/RCCM unlocks higher transaction limits and Pro features.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Step 2: ID Upload */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">2</div>
                        <h3 className="text-xl font-black tracking-tight">Identity Document</h3>
                    </div>
                    <Card className="rounded-3xl border-border/50">
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Document Type</Label>
                                <Select value={idType} onValueChange={(val: any) => setIdType(val)}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-bold">
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="passport">Intl. Passport</SelectItem>
                                        <SelectItem value="national_id">National ID Card (CNI)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {idType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                    <ImageUpload
                                        label="Front of Document"
                                        currentImage={idFront}
                                        onImageChange={setIdFront}
                                        aspectRatio="aspect-video"
                                    />
                                    {idType === 'national_id' && (
                                        <ImageUpload
                                            label="Back of Document"
                                            currentImage={idBack}
                                            onImageChange={setIdBack}
                                            aspectRatio="aspect-video"
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Step 3: Selfie */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">3</div>
                        <h3 className="text-xl font-black tracking-tight">Liveness Check</h3>
                    </div>
                    <Card className="rounded-3xl border-border/50">
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <Alert className="bg-blue-50 border-blue-100">
                                <ScanFace className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800 font-bold">Instructions</AlertTitle>
                                <AlertDescription className="text-blue-700 text-xs mt-1">
                                    Please take a clear selfie holding your ID document next to your face. Ensure details on ID are readable.
                                </AlertDescription>
                            </Alert>

                            <div className="max-w-xs mx-auto">
                                <ImageUpload
                                    label="Selfie with ID"
                                    currentImage={selfie}
                                    onImageChange={setSelfie}
                                    aspectRatio="aspect-square"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Button
                    type="submit"
                    className="w-full h-16 rounded-3xl bg-bouteek-green text-black hover:bg-white hover:text-black hover:border-2 hover:border-black font-black uppercase tracking-[0.2em] shadow-2xl transition-all"
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                        </>
                    ) : "Verify Identity"}
                </Button>

            </form>
        </div>
    );
}
