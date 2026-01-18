"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FinancePage() {
    const { t } = useTranslation();
    const [amount, setAmount] = useState("");
    const [showTopUp, setShowTopUp] = useState(false);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: merchant } = await supabase.from('merchants').select('id, bouteek_cash_balance').eq('user_id', user.id).single();
        if (merchant) {
            setBalance(merchant.bouteek_cash_balance);

            const { data: txs } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('merchant_id', merchant.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (txs) {
                setTransactions(txs.map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    label: tx.description,
                    date: new Date(tx.created_at).toLocaleDateString(),
                    amount: tx.amount,
                    status: "completed", // assuming mostly completed for now
                    trendingUp: tx.amount > 0
                })));
            }
        }
    };

    const pressKey = (key: string) => {
        if (key === "back") {
            setAmount(prev => prev.slice(0, -1));
        } else if (amount.length < 8) {
            setAmount(prev => prev + key);
        }
    };

    // ... rest of the render code remains similar, but using 'balance' and 'transactions' state variables
    // Updating the balance display section:

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="hero-text !text-4xl">{t("finance.title")}</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage your Bouteek Cash and earnings.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowTopUp(true)}
                        className="rounded-2xl bg-bouteek-green text-black font-bold h-12 px-8 shadow-lg shadow-bouteek-green/20"
                    >
                        <Plus className="mr-2" size={20} />
                        {t("finance.top_up")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Side: Wallet Card & Top-up */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border/50 rounded-4xl p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-bouteek-green/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-bouteek-green/10 transition-colors" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-bouteek-green/10 flex items-center justify-center text-bouteek-green mb-6">
                                <Wallet size={32} />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("finance.available_balance")}</p>
                            <h2 className="text-6xl md:text-8xl font-black mt-4 tracking-tighter">
                                {Number(balance).toLocaleString()} <span className="text-2xl md:text-3xl text-muted-foreground font-medium tracking-normal">XOF</span>
                            </h2>

                            <div className="flex gap-4 mt-12 w-full max-w-sm">
                                <Button variant="outline" className="flex-1 rounded-2xl h-14 font-bold border-border/50">Analytics</Button>
                                <Button className="flex-1 rounded-2xl h-14 font-bold bg-black text-white shadow-xl shadow-black/20">Transfer</Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Transaction Log */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <History size={24} />
                                Transaction Log
                            </h3>
                            <Button variant="ghost" className="text-sm font-bold text-bouteek-green">See All</Button>
                        </div>

                        <div className="space-y-3">
                            {transactions.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bouteek-card p-5 group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                tx.trendingUp ? "bg-bouteek-green/10 text-bouteek-green" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {tx.trendingUp ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm">{tx.label}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-black text-lg", tx.trendingUp ? "text-bouteek-green" : "text-foreground")}>
                                                {tx.amount}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Side: Quick Top-Up Pad */}
                <div className="lg:col-span-1">
                    <div className="bouteek-card p-8 sticky top-12">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bouteek-green/10 text-bouteek-green font-bold text-[10px] uppercase tracking-widest">
                                <ShieldCheck size={14} />
                                Secure PayDunya Bridge
                            </div>

                            <div className="w-full">
                                <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Amount to Top-Up</p>
                                <div className="h-20 bg-muted rounded-3xl flex items-center justify-center border-2 border-transparent focus-within:border-bouteek-green transition-all overflow-hidden group">
                                    <span className="text-4xl font-black">{amount || "0"}</span>
                                    <span className="ml-2 text-xl text-muted-foreground font-black">XOF</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 w-full">
                                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) => (
                                    <Button
                                        key={key}
                                        variant="ghost"
                                        onClick={() => pressKey(key)}
                                        className={cn(
                                            "h-16 rounded-2xl text-xl font-black hover:bg-muted active:scale-90 transition-all",
                                            key === "back" ? "text-red-500" : ""
                                        )}
                                    >
                                        {key === "back" ? "←" : key}
                                    </Button>
                                ))}
                            </div>

                            <div className="w-full space-y-3 mt-4">
                                <Button className="w-full h-14 rounded-2xl bg-bouteek-green text-black font-black uppercase tracking-widest shadow-xl shadow-bouteek-green/20">
                                    Continue to Wave
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                                <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                                    <img src="https://paydunya.com/assets/images/payment_methods/wave.png" className="h-6 object-contain" alt="Wave" />
                                    <img src="https://paydunya.com/assets/images/payment_methods/om.png" className="h-6 object-contain" alt="Orange Money" />
                                    <CreditCard size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
