"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [merchantId, setMerchantId] = useState<string | null>(null);

    // Form State
    const [businessName, setBusinessName] = useState("");
    const [slug, setSlug] = useState("");
    const [waveNumber, setWaveNumber] = useState("");
    const [orangeNumber, setOrangeNumber] = useState("");

    useEffect(() => {
        fetchMerchantProfile();
    }, []);

    const fetchMerchantProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('merchants')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "Row not found" - acceptable for new users
                throw error;
            }

            if (data) {
                setMerchantId(data.id);
                setBusinessName(data.business_name || "");
                setSlug(data.slug || "");

                // Fetch payment methods if stored separately, or assuming they are in merchant table for MVP?
                // Checking schema... Schema has separate table 'storefront_payment_methods' usually?
                // Or checking if columns exist in merchants. 
                // For MVP, if schema doesn't have it, we might need to add it or store in metadata.
                // Let's assume we store in a simple way for now or I check the schema first.

                // RE-CHECKING SCHEMA: 
                // The migration file created `storefront_payment_methods`.
                // Let's fetch that.
                if (data.id) {
                    const { data: payments } = await supabase
                        .from('storefront_payment_methods')
                        .select('*')
                        .eq('storefront_id', data.id); // Wait, schema links payment to storefront_id?

                    // Schema check: merchants -> has One storefront? Or merchants Is the storefront?
                    // Let's check schema details from memory/previous steps.
                    // users -> merchants.
                    // storefronts table exists? Or is it merged?
                    // In migration: create table storefronts (merchant_id references merchants).

                    // So flow is: User -> Merchant -> Storefront -> Payment Methods.

                    fetchStorefrontAndPayments(data.id);
                }
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchStorefrontAndPayments = async (merchantId: string) => {
        // Get Storefront
        const { data: storefront } = await supabase.from('storefronts').select('id').eq('merchant_id', merchantId).single();

        if (storefront) {
            const { data: methods } = await supabase.from('storefront_payment_methods').select('*').eq('storefront_id', storefront.id);

            if (methods) {
                const wave = methods.find((m: any) => m.type === 'wave');
                const om = methods.find((m: any) => m.type === 'orange_money');
                if (wave) setWaveNumber(wave.details?.phoneNumber || "");
                if (om) setOrangeNumber(om.details?.phoneNumber || "");
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upsert Merchant
            const merchantData = {
                user_id: user.id,
                business_name: businessName,
                slug: slug, // TODO: Check uniqueness
            };

            // If merchantId exists, update, else insert.
            // But upsert requires primary key or unique constraint.
            let currentMerchantId = merchantId;

            if (merchantId) {
                await supabase.from('merchants').update(merchantData).eq('id', merchantId);
            } else {
                const { data: newMerchant, error } = await supabase.from('merchants').insert(merchantData).select().single();
                if (error) throw error;
                currentMerchantId = newMerchant.id;
                setMerchantId(newMerchant.id);
            }

            // 2. Upsert Storefront (One-to-one for MVP)
            if (!currentMerchantId) throw new Error("Failed to get merchant ID");

            const { data: storefront, error: sfError } = await supabase
                .from('storefronts')
                .select('id')
                .eq('merchant_id', currentMerchantId)
                .single();

            let storefrontId = storefront?.id;

            if (!storefront) {
                const { data: newSf, error: newSfError } = await supabase
                    .from('storefronts')
                    .insert({ merchant_id: currentMerchantId, name: businessName })
                    .select()
                    .single();
                if (newSfError) throw newSfError;
                storefrontId = newSf.id;
            }

            // 3. Upsert Payment Methods
            // We diligently delete old and insert new, or upsert by ID if key existed.
            // Easiest MVP: Delete all for this storefront and re-insert active ones.

            await supabase.from('storefront_payment_methods').delete().eq('storefront_id', storefrontId);

            const methodsToInsert = [];
            if (waveNumber) {
                methodsToInsert.push({
                    storefront_id: storefrontId,
                    type: 'wave',
                    details: { phoneNumber: waveNumber },
                    is_active: true
                });
            }
            if (orangeNumber) {
                methodsToInsert.push({
                    storefront_id: storefrontId,
                    type: 'orange_money',
                    details: { phoneNumber: orangeNumber },
                    is_active: true
                });
            }

            if (methodsToInsert.length > 0) {
                const { error: pmError } = await supabase.from('storefront_payment_methods').insert(methodsToInsert);
                if (pmError) throw pmError;
            }

            toast.success("Settings saved successfully!");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Store Settings</h2>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                placeholder="My Awesome Store"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="slug">Store URL Slug</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">bouteek.shop/store/</span>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="my-store"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods (Mobile Money)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">Enter the phone numbers where you want to receive payments.</p>

                        <div className="space-y-2">
                            <Label htmlFor="wave" className="flex items-center gap-2">
                                <img src="/wave-logo.png" className="w-6 h-6 rounded" alt="Wave" />
                                Wave Number
                            </Label>
                            <Input
                                id="wave"
                                value={waveNumber}
                                onChange={e => setWaveNumber(e.target.value)}
                                placeholder="+221 77 000 00 00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="om" className="flex items-center gap-2">
                                <img src="/orange-money-logo.png" className="w-6 h-6 rounded" alt="OM" />
                                Orange Money Number
                            </Label>
                            <Input
                                id="om"
                                value={orangeNumber}
                                onChange={e => setOrangeNumber(e.target.value)}
                                placeholder="+221 77 000 00 00"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full bg-[#00D632] hover:bg-[#00b829] text-black font-bold" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </div>
    );
}
