"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Wallet
} from "lucide-react";
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

export default function MerchantsManagement() {
    const [merchants, setMerchants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Credit Adjustment State
    const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
    const [creditAmount, setCreditAmount] = useState("");
    const [creditReason, setCreditReason] = useState("");
    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);

    useEffect(() => {
        fetchMerchants();
    }, [page, search, filter]);

    async function fetchMerchants() {
        setIsLoading(true);
        try {
            // Debounce matching logic is handled by basic re-render for now
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
        fetchMerchants();
    };

    const handleBan = async (merchant: any) => {
        if (confirm("Are you sure you want to ban/unban this merchant?")) {
            await toggleMerchantBan(merchant.id, merchant.is_banned);
            fetchMerchants();
        }
    };

    const handleCreditAdjustment = async () => {
        if (!selectedMerchant || !creditAmount) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("You must be logged in as admin");

        const result = await adjustMerchantCredit(
            selectedMerchant.id,
            parseInt(creditAmount),
            creditReason,
            user.id
        );

        if (result.error) {
            alert("Error: " + result.error);
        } else {
            setIsCreditDialogOpen(false);
            setCreditAmount("");
            setCreditReason("");
            fetchMerchants();
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Merchants</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage all registered businesses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search merchants..."
                            className="pl-9 w-[300px] rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 pb-4 overflow-x-auto">
                {['all', 'verified', 'unverified', 'banned', 'pro', 'growth'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors",
                            filter === f
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-border/50">
                            <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Merchant</th>
                            <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Balance</th>
                            <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Joined</th>
                            <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                        ) : merchants.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No merchants found.</td></tr>
                        ) : merchants.map((merchant) => (
                            <tr key={merchant.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold text-gray-500">
                                            {merchant.business_name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{merchant.business_name}</p>
                                            <p className="text-xs text-muted-foreground">{merchant.users?.email || 'No email'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col gap-1 items-start">
                                        {merchant.is_banned ? (
                                            <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">
                                                <ShieldAlert size={12} /> Banned
                                            </span>
                                        ) : merchant.is_verified ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md">
                                                Unverified
                                            </span>
                                        )}
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground border px-1 rounded">
                                            {merchant.subscription_tier}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-mono text-sm">
                                    {merchant.bouteek_cash_balance?.toLocaleString()} XOF
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {new Date(merchant.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-xl">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleVerify(merchant)}>
                                                {merchant.is_verified ? "Revoke Verification" : "Verify Merchant"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedMerchant(merchant);
                                                setIsCreditDialogOpen(true);
                                            }}>
                                                Adjust Credit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleBan(merchant)}>
                                                {merchant.is_banned ? "Unban Merchant" : "Ban Merchant"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls could go here */}

            {/* Credit Dialog */}
            <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Credit Balance</DialogTitle>
                        <DialogDescription>
                            Add or subtract funds from {selectedMerchant?.business_name}'s wallet.
                            Use negative values to subtract.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Amount (XOF)</label>
                            <Input
                                type="number"
                                placeholder="e.g. 5000 or -500"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Reason</label>
                            <Input
                                placeholder="e.g. Refund for order #123"
                                value={creditReason}
                                onChange={(e) => setCreditReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreditAdjustment}>Confirm Adjustment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
