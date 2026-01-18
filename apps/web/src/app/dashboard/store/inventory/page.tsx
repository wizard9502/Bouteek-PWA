"use client";

import { useState } from "react";
import {
    RefreshCcw,
    Smartphone,
    Globe,
    Instagram,
    Check,
    AlertTriangle,
    Plus,
    Link as LinkIcon,
    Loader2,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";


export default function InventorySyncPage() {
    const { language } = useTranslation();
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [newChannel, setNewChannel] = useState("Instagram Shopping");
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
            if (!merchant) return;

            const { data } = await supabase
                .from('inventory_channels')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            setChannels(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();

            const { error } = await supabase.from('inventory_channels').insert({
                merchant_id: merchant?.id,
                name: newChannel,
                status: 'connected',
                last_sync: new Date().toISOString()
            });

            if (error) throw error;
            toast.success(`${newChannel} connected!`);
            setIsConnectOpen(false);
            fetchChannels();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSync = async (id: string, name: string) => {
        toast.promise(
            supabase.from('inventory_channels').update({
                last_sync: new Date().toISOString(),
                status: 'syncing'
            }).eq('id', id),
            {
                loading: `Syncing ${name}...`,
                success: () => {
                    setTimeout(() => {
                        supabase.from('inventory_channels').update({ status: 'connected' }).eq('id', id);
                        fetchChannels();
                    }, 2000);
                    return `${name} synchronized!`;
                },
                error: 'Sync failed'
            }
        );
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('inventory_channels').delete().eq('id', id);
            if (error) throw error;
            setChannels(channels.filter(c => c.id !== id));
            toast.success("Channel disconnected");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getIcon = (name: string) => {
        if (name.includes("Storefront")) return Globe;
        if (name.includes("POS")) return Smartphone;
        if (name.includes("Instagram")) return Instagram;
        return LinkIcon;
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Sync Inventaire" : "Inventory Sync"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Synchronisez votre stock sur tous vos canaux de vente." : "Keep your stock synchronized across all sales channels."}</p>
                </div>
                <Button className="rounded-2xl bg-black text-white font-bold h-12 px-6" onClick={() => fetchChannels()}>
                    <RefreshCcw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
                    {language === 'fr' ? "Rafraîchir" : "Refresh Status"}
                </Button>
            </div>

            {loading ? (
                <div className="col-span-1 md:col-span-3 flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : channels.map((channel, i) => {
                const Icon = getIcon(channel.name);
                return (
                    <motion.div
                        key={channel.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-8 rounded-4xl border-border/50 h-full flex flex-col justify-between group hover:border-bouteek-green/30 transition-all">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-bouteek-green/10 group-hover:text-bouteek-green transition-colors">
                                        <Icon size={32} />
                                    </div>
                                    <Badge className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase ${channel.status === 'connected' || channel.status === 'Synced' ? 'bg-bouteek-green/10 text-bouteek-green' :
                                            channel.status === 'syncing' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                                                'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {channel.status}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">{channel.name}</h3>
                                <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">{channel.name.includes('Storefront') ? 'Native' : 'External'} Channel</p>
                            </div>

                            <div className="mt-10 pt-6 border-t border-border/50 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                        Last Sync: <span className="text-foreground">{channel.last_sync ? new Date(channel.last_sync).toLocaleTimeString() : 'Never'}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="font-bold text-bouteek-green" onClick={() => handleSync(channel.id, channel.name)}>
                                        <RefreshCcw size={14} className="mr-2" />
                                        Sync Now
                                    </Button>
                                </div>
                                <Button variant="ghost" size="sm" className="font-bold text-red-500 hover:bg-red-50 w-full justify-start rounded-xl" onClick={() => handleDelete(channel.id)}>
                                    <Trash2 size={14} className="mr-2" />
                                    Disconnect
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                );
            })}

            <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
                <DialogTrigger asChild>
                    <button className="aspect-square md:aspect-auto rounded-4xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 hover:border-bouteek-green hover:bg-bouteek-green/5 transition-all group min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-muted-foreground">{language === 'fr' ? "Ajouter un Canal" : "Connect New Channel"}</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-none p-8 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{language === 'fr' ? "Connecter un Canal" : "Connect Channel"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Channel Type</Label>
                            <Select value={newChannel} onValueChange={setNewChannel}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="Instagram Shopping">Instagram Shopping</SelectItem>
                                    <SelectItem value="Facebook Marketplace">Facebook Marketplace</SelectItem>
                                    <SelectItem value="Shopify Sync">Shopify Sync</SelectItem>
                                    <SelectItem value="WhatsApp POS">WhatsApp POS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Connecting a channel allows Bouteek to automatically update stock quantities whenever a purchase is made on that platform.
                        </p>
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-black/90"
                        >
                            {isConnecting ? <Loader2 className="animate-spin" /> : (language === 'fr' ? "Connecter" : "Connect Now")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            <Card className="p-10 rounded-4xl bg-black text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 rounded-4xl bg-bouteek-green flex items-center justify-center text-black shrink-0 shadow-2xl shadow-bouteek-green/20">
                        <AlertTriangle size={48} />
                    </div>
                    <div>
                        <h4 className="text-3xl font-black">{language === 'fr' ? "Prévenir les ruptures" : "Prevent Overselling"}</h4>
                        <p className="text-gray-400 mt-2 max-w-xl font-medium">
                            {language === 'fr'
                                ? "Notre moteur de synchronisation met à jour automatiquement vos stocks sur Facebook, Instagram et WhatsApp dès qu'une vente est réalisée."
                                : "Our sync engine automatically updates your stock levels on Facebook, Instagram, and WhatsApp as soon as a sale is made."}
                        </p>
                        <Button className="mt-6 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest px-8">
                            Configure Safety Stock
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
