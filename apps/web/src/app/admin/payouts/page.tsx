"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAffiliatePayouts, processPayout } from "@/lib/adminData";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function AffiliatePayouts() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        loadPayouts();
    }, [filter]);

    const loadPayouts = async () => {
        setIsLoading(true);
        const data = await getAffiliatePayouts(filter);
        setPayouts(data);
        setIsLoading(false);
    };

    const handleAction = async (id: string, action: 'approve' | 'pay' | 'cancel') => {
        if (!confirm(`Are you sure you want to ${action} this payout?`)) return;

        const { data: { user } } = await supabase.auth.getUser();
        await processPayout(id, action, user?.id || 'system');
        loadPayouts();
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Affiliate Payouts</h1>
                    <p className="text-gray-600 font-medium mt-1">Manage commission withdrawals.</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'paid', 'cancelled'].map(f => (
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
            </div>

            <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-border/50">
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">ID</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Referrer</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Amount</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Status</th>
                            <th className="text-left py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Date</th>
                            <th className="text-right py-4 px-6 text-gray-600 font-black uppercase tracking-wider text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                        ) : payouts.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No payouts found.</td></tr>
                        ) : payouts.map((p) => (
                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 font-mono text-xs text-gray-600">
                                    {p.id.substring(0, 8)}
                                </td>
                                <td className="py-4 px-6">
                                    <p className="font-bold text-gray-900">{p.merchants?.business_name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-600">ID: {p.merchants?.id?.substring(0, 8)}</p>
                                </td>
                                <td className="py-4 px-6 font-mono font-bold text-emerald-600">
                                    {p.amount.toLocaleString()} XOF
                                </td>
                                <td className="py-4 px-6">
                                    {p.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>}
                                    {p.status === 'paid' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>}
                                    {p.status === 'cancelled' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>}
                                </td>
                                <td className="py-4 px-6 text-xs text-gray-500">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {p.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(p.id, 'pay')}>
                                                Approve & Pay
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction(p.id, 'cancel')}>
                                                <XCircle size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
