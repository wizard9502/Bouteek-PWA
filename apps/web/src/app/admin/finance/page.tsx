"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Check, X, Search, Filter, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminFinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pending");

    useEffect(() => {
        fetchTransactions();
    }, [activeTab]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select(`
                    *,
                    merchants (
                        business_name,
                        contact_phone,
                        is_frozen
                    )
                `)
                .eq('type', 'deposit')
                .eq('verification_status', activeTab)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error("Error fetching transactions", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (tx: any, approved: boolean) => {
        setProcessingId(tx.id);
        try {
            if (approved) {
                // 1. Approve: Just mark as completed
                const { error: txError } = await supabase
                    .from('wallet_transactions')
                    .update({
                        verification_status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', tx.id);

                if (txError) throw txError;
                toast.success(`Verified transaction ${tx.reference_id}`);

            } else {
                // 2. Deny: Reverse the topup (Clawback & Freeze if necessary)
                const { data: result, error: rpcError } = await supabase.rpc('reverse_topup', {
                    p_transaction_id: tx.id
                });

                if (rpcError) throw rpcError;
                if (!result.success) throw new Error(result.message);

                toast.info("Transaction denied and funds deducted.");
            }

            // Refresh list
            setTransactions(prev => prev.filter(t => t.id !== tx.id));

        } catch (error: any) {
            console.error("Approval error", error);
            toast.error(error.message || "Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.merchants?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black">Finance Approvals</h1>
                    <p className="text-muted-foreground font-medium mt-1">Review top-ups and monitor failed transactions.</p>
                </div>
                <Button onClick={fetchTransactions} variant="outline" size="sm">Refresh</Button>
            </div>

            <div className="flex bg-muted p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                        activeTab === 'pending' ? 'bg-white shadow text-black' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Pending Verification
                </button>
                <button
                    onClick={() => setActiveTab("failed")}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                        activeTab === 'failed' ? 'bg-white shadow text-red-500' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    Failed / Denied
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search ID or Merchant..."
                        className="pl-10 h-10 rounded-xl"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : filteredTransactions.length === 0 ? (
                <Card className="rounded-3xl border-dashed p-12 text-center text-muted-foreground bg-muted/20">
                    <div className="flex justify-center mb-4">{activeTab === 'pending' ? <Check size={48} className="text-muted-foreground/20" /> : <X size={48} className="text-red-200" />}</div>
                    <h3 className="text-lg font-bold">No {activeTab} transactions</h3>
                    <p>You're all caught up.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredTransactions.map((tx) => (
                        <Card key={tx.id} className={cn(
                            "rounded-2xl border-l-[6px] shadow-sm hover:shadow-md transition-all",
                            activeTab === 'failed' ? 'border-l-red-500 opacity-75' : 'border-l-bouteek-green'
                        )}>
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-xl",
                                        activeTab === 'failed' ? 'bg-red-100 text-red-500' : 'bg-bouteek-green/10 text-bouteek-green'
                                    )}>
                                        <ArrowUpCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black">{tx.amount.toLocaleString()} XOF</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold mt-1">
                                            <span>Wave ID: <span className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{tx.reference_id || "N/A"}</span></span>
                                            <span>•</span>
                                            <span>{new Date(tx.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="font-bold">{tx.merchants?.business_name}</Badge>
                                            {tx.merchants?.is_frozen && <Badge variant="destructive">FROZEN</Badge>}
                                        </div>
                                    </div>
                                </div>

                                {activeTab === 'pending' && (
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-none border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 font-bold"
                                            onClick={() => handleApproval(tx, false)}
                                            disabled={!!processingId}
                                        >
                                            {processingId === tx.id ? <Loader2 className="animate-spin" /> : <><X size={16} className="mr-2" /> Deny</>}
                                        </Button>
                                        <Button
                                            className="flex-1 md:flex-none bg-bouteek-green text-black hover:bg-bouteek-green/90 font-black uppercase tracking-wider"
                                            onClick={() => handleApproval(tx, true)}
                                            disabled={!!processingId}
                                        >
                                            {processingId === tx.id ? <Loader2 className="animate-spin" /> : <><Check size={16} className="mr-2" /> Approve Funds</>}
                                        </Button>
                                    </div>
                                )}
                                {activeTab === 'failed' && (
                                    <div className="text-red-500 font-bold text-sm uppercase tracking-widest">
                                        Denied / Reversed
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
