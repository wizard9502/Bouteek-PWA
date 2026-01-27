"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, CreditCard, ShoppingBag, MapPin, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMerchantDetails, getMerchantOrders, getMerchantKYC, reviewMerchantKYC } from "@/lib/adminData";
import { toast } from "sonner";
import { CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [merchant, setMerchant] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [kyc, setKyc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchMerchantDetails();
    }, [id]);

    const fetchMerchantDetails = async () => {
        try {
            const [merchantData, ordersData, kycData] = await Promise.all([
                getMerchantDetails(id),
                getMerchantOrders(id),
                getMerchantKYC(id)
            ]);

            setMerchant(merchantData);
            setOrders(ordersData);
            setKyc(kycData);

        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveKYC = async () => {
        if (!confirm("Approve these documents and VERIFY this merchant?")) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Unauthorized");

        const res = await reviewMerchantKYC(kyc.id, merchant.id, 'approved', 'Auto-approved by admin', user.id);
        if (res.error) toast.error(res.error);
        else {
            toast.success("Merchant Verified Successfully");
            fetchMerchantDetails();
        }
    };

    const handleRejectKYC = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Unauthorized");

        const res = await reviewMerchantKYC(kyc.id, merchant.id, 'rejected', rejectReason, user.id);
        if (res.error) toast.error(res.error);
        else {
            toast.success("KYC Rejected");
            setRejectDialogOpen(false);
            fetchMerchantDetails();
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!merchant) return <div className="p-20 text-center">Merchant not found</div>;

    return (
        <div className="p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black">{merchant.business_name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                        <span className="font-mono">{merchant.id}</span>
                        <Badge variant={merchant.is_verified ? "default" : "secondary"} className={merchant.is_verified ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                            {merchant.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        {merchant.is_banned && <Badge variant="destructive">Banned</Badge>}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info Cards */}
                <div className="space-y-6">
                    {/* KYC REVIEW CARD */}
                    <Card className="rounded-3xl border-2 border-bouteek-green/20 shadow-lg overflow-hidden">
                        <CardHeader className="bg-bouteek-green/5 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-bouteek-green" /> KYC Protocol</span>
                                {kyc ? (
                                    <Badge variant={kyc.status === 'approved' ? 'default' : kyc.status === 'pending' ? 'secondary' : 'destructive'}>
                                        {kyc.status.toUpperCase()}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">NO SUBMISSION</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {kyc ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">ID Type</p>
                                            <p className="text-sm font-bold uppercase">{kyc.id_type}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Submitted</p>
                                            <p className="text-sm font-mono text-muted-foreground">{new Date(kyc.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">NINEA</p>
                                            <p className="text-sm font-mono">{kyc.ninea || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">RCCM</p>
                                            <p className="text-sm font-mono">{kyc.rccm || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Documents</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <a href={kyc.id_document_front_url} target="_blank" rel="noopener noreferrer" className="block relative group aspect-video bg-muted rounded-xl overflow-hidden border border-border">
                                                <img src={kyc.id_document_front_url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="text-white" size={20} />
                                                </div>
                                                <div className="absolute bottom-1 left-2 text-[8px] font-black text-white uppercase bg-black/50 px-2 rounded">Front</div>
                                            </a>
                                            {kyc.id_document_back_url && (
                                                <a href={kyc.id_document_back_url} target="_blank" rel="noopener noreferrer" className="block relative group aspect-video bg-muted rounded-xl overflow-hidden border border-border">
                                                    <img src={kyc.id_document_back_url} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-1 left-2 text-[8px] font-black text-white uppercase bg-black/50 px-2 rounded">Back</div>
                                                </a>
                                            )}
                                            <a href={kyc.selfie_url} target="_blank" rel="noopener noreferrer" className="block relative group aspect-square bg-muted rounded-xl overflow-hidden border border-border col-span-2 w-1/2 mx-auto">
                                                <img src={kyc.selfie_url} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-1 left-2 text-[8px] font-black text-white uppercase bg-black/50 px-2 rounded">Selfie</div>
                                            </a>
                                        </div>
                                    </div>

                                    {kyc.status === 'pending' && (
                                        <div className="flex gap-2 pt-4">
                                            <Button onClick={() => setRejectDialogOpen(true)} variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                                                <XCircle size={16} className="mr-2" /> Reject
                                            </Button>
                                            <Button onClick={handleApproveKYC} className="flex-1 bg-bouteek-green text-black hover:bg-emerald-400">
                                                <CheckCircle2 size={16} className="mr-2" /> Approve
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 opacity-50">
                                    <FileText size={32} className="mx-auto mb-2" />
                                    <p className="text-xs uppercase font-bold">No Documents Uploaded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Store size={18} /> Business Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium">{merchant.users?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Phone</p>
                                    <p className="text-sm font-medium">{merchant.contact_phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Address</p>
                                    <p className="text-sm font-medium">{merchant.business_address || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-muted-foreground mt-1" size={16} />
                                <div>
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Joined</p>
                                    <p className="text-sm font-medium">{new Date(merchant.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CreditCard size={18} /> Financials
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/20 rounded-xl">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Wallet Balance</p>
                                <p className="text-2xl font-black mt-1">{merchant.bouteek_cash_balance?.toLocaleString()} XOF</p>
                            </div>
                            <div className="p-4 bg-muted/20 rounded-xl">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Subscription Tier</p>
                                <p className="text-lg font-bold mt-1 uppercase">{merchant.subscription_tier}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Order History */}
                <div className="lg:col-span-2">
                    <Card className="rounded-3xl border-border/50 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag size={18} /> Recent Orders
                            </CardTitle>
                            <CardDescription>Last 50 transactions for this merchant.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">ID</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 rounded-r-lg">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-muted-foreground">No orders found.</td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/5">
                                                    <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{order.customer_name}</div>
                                                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-bold">{order.total_amount?.toLocaleString()} XOF</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="uppercase text-[10px]">
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject KYC Submission</DialogTitle>
                        <DialogDescription>Please provide a reason for the rejection to notify the merchant.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for rejection (e.g. Blurry ID, Expired document...)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectKYC}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
