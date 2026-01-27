"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Wallet,
    ArrowUpRight,
    Zap,
    Activity,
    Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllMerchants, toggleMerchantVerify, toggleMerchantBan, adjustMerchantCredit } from "@/lib/adminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MerchantsManagement() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    // Credit Adjustment State
    const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
    const [creditAmount, setCreditAmount] = useState("");
    const [creditReason, setCreditReason] = useState("");
    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
    const [isSubdomain, setIsSubdomain] = useState(false);

    // Detect subdomain
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bouteek.shop";
            setIsSubdomain(hostname === `admin.${rootDomain}` || hostname.startsWith("admin."));
        }
    }, []);

    useEffect(() => {
        fetchMerchants();
    }, [page, search, filter]);

    async function fetchMerchants() {
        setIsLoading(true);
        try {
            const { data, count } = await getAllMerchants(page, 20, search, filter === 'all' ? undefined : filter);
            setMerchants(data || []);
            setTotal(count || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const handleVerify = async (merchant: any) => {
        await toggleMerchantVerify(merchant.id, merchant.is_verified);
        toast.success("Merchant verification status updated");
        fetchMerchants();
    };

    const handleBan = async (merchant: any) => {
        if (confirm("Confirm security override: Ban/Unban merchant?")) {
            await toggleMerchantBan(merchant.id, merchant.is_banned);
            toast.success("Merchant access status updated");
            fetchMerchants();
        }
    };

    const handleCreditAdjustment = async () => {
        if (!selectedMerchant || !creditAmount) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Unauthorized: Admin credentials required");

        const result = await adjustMerchantCredit(
            selectedMerchant.id,
            parseInt(creditAmount),
            creditReason,
            user.id
        );

        if (result.error) {
            toast.error("Protocol Error: " + result.error);
        } else {
            toast.success("Liquid credit adjustment synchronized");
            setIsCreditDialogOpen(false);
            setCreditAmount("");
            setCreditReason("");
            fetchMerchants();
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Advanced Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-4 border-b border-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Network Active</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                        MERCHANT <span className="text-muted-foreground/20">NETWORK</span>
                    </h1>
                    <p className="text-muted-foreground font-bold tracking-[0.1em] text-sm uppercase">Global Marketplace Entity Management & Credit Protocol</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <Input
                            placeholder="SEARCH ENTITY OR DOMAIN..."
                            className="pl-12 w-[350px] h-14 bg-muted/20 border-border rounded-full text-[11px] font-black uppercase tracking-widest focus:ring-primary focus:border-primary/50 placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Network Visualization (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Nodes", value: total, icon: Globe, color: "text-blue-500" },
                    { label: "Verified Partners", value: "--", icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "Premium Tiers", value: "--", icon: Zap, color: "text-purple-500" },
                    { label: "Liquid Volume", value: "--", icon: Wallet, color: "text-emerald-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-[2rem] flex items-center justify-between group hover:border-border/80 transition-all shadow-sm">
                        <div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                        </div>
                        <stat.icon size={20} className={cn("opacity-40 group-hover:opacity-100 transition-all", stat.color)} />
                    </div>
                ))}
            </div>

            {/* Filter Matrix */}
            <div className="flex flex-wrap gap-2">
                {['all', 'verified', 'unverified', 'banned', 'pro', 'growth'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border",
                            filter === f
                                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                : "bg-muted/10 text-muted-foreground border-border hover:border-border/80 hover:bg-muted/20"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Merchant Ledger Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[3rem] border border-border shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Business Entity</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Verification / Tier</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Liquid Balance</th>
                                <th className="text-left py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Onboard Date</th>
                                <th className="text-right py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Scanning Network Nodes</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : merchants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center opacity-30 font-black uppercase tracking-[0.4em] text-[10px]">Registry Empty</td>
                                </tr>
                            ) : merchants.map((merchant) => (
                                <tr key={merchant.id} className="group hover:bg-muted/5 transition-all">
                                    <td className="py-8 px-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-muted/20 border border-border flex items-center justify-center font-black text-primary shadow-inner group-hover:border-primary/30 transition-all">
                                                {merchant.business_name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground text-sm uppercase tracking-wider group-hover:text-primary transition-colors">{merchant.business_name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{merchant.users?.email || 'NODATA@ENTITY.LOCAL'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-8">
                                        <div className="flex flex-col gap-2 items-start">
                                            {merchant.is_banned ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Blacklisted</span>
                                                </div>
                                            ) : merchant.is_verified ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Partner</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pending Audit</span>
                                                </div>
                                            )}
                                            <div className="px-2 py-0.5 rounded bg-muted/10 border border-border text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                                                {merchant.subscription_tier || 'STARTER'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-8">
                                        <p className="text-foreground font-black text-sm">{merchant.bouteek_cash_balance?.toLocaleString()} <span className="text-muted-foreground text-[10px]">XOF</span></p>
                                    </td>
                                    <td className="py-8 px-8 text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                                        {new Date(merchant.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-8 px-8 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-primary/20 hover:text-primary transition-all duration-500">
                                                    <MoreHorizontal size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-popover border-border rounded-[2rem] p-4 w-64 shadow-2xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Protocol Menu</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-xl py-3 focus:bg-primary focus:text-primary-foreground font-bold uppercase text-[9px] tracking-widest cursor-pointer" onClick={() => router.push(`/admin/merchants/${merchant.id}`)}>
                                                    View Entity Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-3 focus:bg-primary focus:text-primary-foreground font-bold uppercase text-[9px] tracking-widest" onClick={() => handleVerify(merchant)}>
                                                    {merchant.is_verified ? "Revoke Trust" : "Authorize Node"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-3 focus:bg-primary focus:text-primary-foreground font-bold uppercase text-[9px] tracking-widest" onClick={() => {
                                                    setSelectedMerchant(merchant);
                                                    setIsCreditDialogOpen(true);
                                                }}>
                                                    Inject Credits
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-border my-2" />
                                                <DropdownMenuItem className="rounded-xl py-3 focus:bg-red-600 focus:text-white font-black uppercase text-[9px] tracking-widest text-red-500 focus:bg-red-50" onClick={() => handleBan(merchant)}>
                                                    {merchant.is_banned ? "Reauthorize Access" : "Sever Connection"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Credit Injection Dialog */}
            <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                <DialogContent className="bg-popover backdrop-blur-3xl border-border rounded-[3rem] p-10 max-w-xl shadow-2xl text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none">Credit <span className="text-primary">Injection</span></DialogTitle>
                        <DialogDescription className="text-muted-foreground font-bold tracking-[0.1em] text-[10px] uppercase mt-2">
                            Wallet adjustment for {selectedMerchant?.business_name}. Negative integers will decrement balance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8 py-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Injection Value (XOF)</label>
                            <Input
                                type="number"
                                placeholder="E.G. 5000 OR -500"
                                className="h-16 rounded-full bg-muted/20 border-border text-[11px] font-black uppercase tracking-widest px-8 placeholder:text-muted-foreground"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Protocol Reason</label>
                            <Input
                                placeholder="E.G. REFUND FOR TRANSACTION ID..."
                                className="h-16 rounded-full bg-muted/20 border-border text-[11px] font-black uppercase tracking-widest px-8 placeholder:text-muted-foreground"
                                value={creditReason}
                                onChange={(e) => setCreditReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-4">
                        <Button variant="ghost" className="rounded-full h-14 px-10 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20" onClick={() => setIsCreditDialogOpen(false)}>CANCEL</Button>
                        <Button className="rounded-full h-14 px-10 font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20" onClick={handleCreditAdjustment}>EXECUTE SYNC</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
