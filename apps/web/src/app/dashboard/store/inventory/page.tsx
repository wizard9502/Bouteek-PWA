"use client";

import { useState, useEffect } from "react";
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
    Trash2,
    Box,
    Save,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function InventoryPage() {
    const { language } = useTranslation();
    const [activeTab, setActiveTab] = useState("stock");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="hero-text !text-4xl">Inventory</h1>
                <p className="text-muted-foreground font-medium mt-1">Manage stock levels and sync across channels.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl">
                    <TabsTrigger value="stock" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Stock Management</TabsTrigger>
                    <TabsTrigger value="channels" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Sync Channels</TabsTrigger>
                </TabsList>

                <TabsContent value="stock">
                    <InventoryStockManager />
                </TabsContent>

                <TabsContent value="channels">
                    <InventoryChannelsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InventoryStockManager() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
        if (!merchant) return;

        const { data } = await supabase.from('products').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false });
        setProducts(data || []);
        setIsLoading(false);
    };

    const updateStock = async (id: string, field: 'stock_quantity' | 'low_stock_threshold', value: number) => {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

        try {
            const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id);
            if (error) throw error;
            toast.success("Updated successfully");
        } catch (err) {
            toast.error("Failed to update");
            fetchProducts(); // Revert
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search products..."
                        className="pl-10 rounded-xl h-12 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    className="h-12 w-12 p-0 rounded-xl"
                    onClick={() => toast.info('Advanced filtering coming soon')}
                >
                    <Filter size={18} />
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Product</th>
                                <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Stock</th>
                                <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Safety Stock (Threshold)</th>
                                <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filtered.map((product) => (
                                <tr key={product.id} className="group hover:bg-muted/20">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{Number(product.price).toLocaleString()} XOF</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <Input
                                                type="number"
                                                className="w-20 text-center font-bold rounded-lg h-10 border-border/50 focus:border-black"
                                                value={product.stock_quantity || 0}
                                                onChange={(e) => updateStock(product.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Input
                                                type="number"
                                                className="w-20 text-center font-bold rounded-lg h-10 border-border/50 bg-yellow-50/50 focus:border-yellow-500 text-yellow-700"
                                                value={product.low_stock_threshold || 5}
                                                onChange={(e) => updateStock(product.id, 'low_stock_threshold', parseInt(e.target.value) || 0)}
                                            />
                                            <AlertTriangle size={14} className="text-yellow-500 opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {((product.stock_quantity || 0) <= (product.low_stock_threshold || 5)) ? (
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Low Stock</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="p-12 text-center text-muted-foreground">No products found.</div>}
            </div>
        </div>
    );
}

function InventoryChannelsManager() {
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
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button className="rounded-2xl bg-black text-white font-bold h-12 px-6" onClick={() => fetchChannels()}>
                    <RefreshCcw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
                    {language === 'fr' ? "Rafraîchir" : "Refresh Status"}
                </Button>
            </div>

            {loading ? (
                <div className="col-span-1 md:col-span-3 flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map((channel, i) => {
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
                </div>
            )}
        </div>
    );
}
