"use client";

import { useState } from "react";
import {
    Star,
    MessageSquare,
    CheckCircle,
    ShieldAlert,
    Filter,
    Reply,
    MoreHorizontal,
    Loader2,
    ThumbsUp,
    ThumbsDown,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";


export default function ReviewsPage() {
    const { t, language } = useTranslation();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        average: 0,
        pending: 0,
        total: 0
    });
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
            if (!merchant) return;

            const { data } = await supabase
                .from('product_reviews')
                .select('*, products(name)')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false });

            setReviews(data || []);

            // Calculate stats
            if (data && data.length > 0) {
                const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
                setStats({
                    average: Number(avg.toFixed(1)),
                    pending: data.filter(r => r.status === 'pending').length,
                    total: data.length
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase.from('product_reviews').update({ status }).eq('id', id);
            if (error) throw error;
            toast.success(`Review ${status}`);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReply = async () => {
        if (!replyText) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('product_reviews').update({
                response: replyText,
                responded_at: new Date().toISOString()
            }).eq('id', replyingTo.id);

            if (error) throw error;
            toast.success("Reply sent!");
            setReplyingTo(null);
            setReplyText("");
            fetchReviews();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{language === 'fr' ? "Avis Clients" : "Customer Reviews"}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{language === 'fr' ? "Modérez et répondez aux retours de vos clients." : "Moderate and reply to customer feedback."}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/50 font-bold">
                        <Filter className="mr-2" size={18} />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-8 rounded-4xl border-border/50 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Average Rating</p>
                    <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-4xl font-black">{stats.average || '0.0'}</h3>
                        <Star className="text-amber-500 fill-amber-500" size={24} />
                    </div>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending Approval</p>
                    <h3 className="text-4xl font-black mt-2 text-amber-500">{stats.pending}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Reviews</p>
                    <h3 className="text-4xl font-black mt-2">{stats.total}</h3>
                </Card>
                <Card className="p-8 rounded-4xl border-border/50 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verified Customers</p>
                    <h3 className="text-4xl font-black mt-2">{reviews.filter(r => r.is_verified).length}</h3>
                </Card>

            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tight">{language === 'fr' ? "Retours Récents" : "Recent Feedback"}</h3>
                <div className="space-y-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground font-medium">No reviews yet. They will appear here once customers start sharing their feedback.</div>
                        ) : reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bouteek-card p-8 group relative"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <Avatar className="w-16 h-16 rounded-2xl border-2 border-border/50 bg-muted">
                                        <AvatarFallback className="text-black font-black uppercase">{review.customer_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-xl">{review.customer_name}</h4>
                                                    {review.is_verified && (
                                                        <Badge className="bg-bouteek-green/10 text-bouteek-green border-none rounded-full px-2 py-0 font-black text-[8px] uppercase">
                                                            {language === 'fr' ? "Achat Vérifié" : "Verified Purchase"}
                                                        </Badge>
                                                    )}
                                                    <Badge className={`rounded-xl px-2 py-0.5 text-[8px] font-black uppercase ${review.status === 'approved' ? 'bg-bouteek-green text-black' :
                                                            review.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                                                        }`}>
                                                        {review.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                                    {new Date(review.created_at).toLocaleDateString()} • {review.products?.name || 'Product Deleted'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} size={16} className={idx < review.rating ? "text-amber-500 fill-amber-500" : "text-muted"} />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            "{review.comment}"
                                        </p>

                                        {review.response && (
                                            <div className="p-4 rounded-2xl bg-muted/30 border-l-4 border-bouteek-green mt-4">
                                                <p className="text-[10px] font-black uppercase text-bouteek-green mb-1">Your response</p>
                                                <p className="text-sm font-medium italic">"{review.response}"</p>
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            {review.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatus(review.id, 'approved')}>
                                                        <ThumbsUp size={14} className="mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="rounded-xl font-bold border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleStatus(review.id, 'rejected')}>
                                                        <ThumbsDown size={14} className="mr-2" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {!review.response && review.status === 'approved' && (
                                                <Button variant="outline" size="sm" className="rounded-xl font-bold border-border/50" onClick={() => setReplyingTo(review)}>
                                                    <Reply size={14} className="mr-2" />
                                                    Reply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
                        <DialogContent className="rounded-3xl border-none p-8 max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Reply to {replyingTo?.customer_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                <div className="bg-muted/30 p-4 rounded-2xl italic text-sm text-muted-foreground">
                                    "{replyingTo?.comment}"
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Message</Label>
                                    <Input
                                        placeholder="Thank you for your feedback!"
                                        className="h-12 rounded-xl bg-muted/30 font-bold"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleReply}
                                    disabled={isSubmitting}
                                    className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-black/90"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Response"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </div>
    );
}
