"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Phone, MessageCircle, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SuspensionScreenProps {
    debtAmount: number;
    businessName: string;
    merchantId: string;
    onPaymentSubmitted?: () => void;
}

export default function SuspensionScreen({
    debtAmount,
    businessName,
    merchantId,
    onPaymentSubmitted
}: SuspensionScreenProps) {
    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Wave payment link - replace with actual Bouteek Wave merchant ID
    const wavePaymentLink = `https://pay.wave.com/m/M_sn__dJJVmYlh4yk/c/sn/?amount=${debtAmount}`;

    const handleDebtPayment = async () => {
        if (!transactionId || transactionId.length !== 17) {
            toast.error("Please enter a valid 17-character Wave Transaction ID");
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('reactivate_merchant', {
                p_merchant_id: merchantId,
                p_payment_wave_tx_id: transactionId,
                p_payment_amount: debtAmount
            });

            if (error) throw error;

            if (data.success) {
                toast.success(data.message);
                onPaymentSubmitted?.();
            } else {
                toast.error(data.message);
            }
        } catch (err: any) {
            toast.error(err.message || "Payment submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-6">
            {/* Main Card */}
            <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={40} className="text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-black text-white text-center mb-2">
                    Paiement Non Confirmé ⚠️
                </h1>
                <h2 className="text-lg font-bold text-white/60 text-center mb-6">
                    Payment Not Confirmed
                </h2>

                {/* Message */}
                <div className="bg-white/5 rounded-2xl p-5 mb-6 space-y-4 text-white/80 text-sm leading-relaxed">
                    <p>
                        Après vérification, nous n'avons trouvé aucune trace de votre transaction Wave.
                    </p>
                    <p>
                        <span className="font-bold text-red-400">Conséquence:</span> Votre compte est temporairement suspendu.
                    </p>
                </div>

                {/* Debt Amount */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 text-center">
                    <p className="text-white/60 text-sm uppercase tracking-widest mb-2">
                        Montant à Régulariser
                    </p>
                    <h3 className="text-4xl font-black text-red-400">
                        {debtAmount.toLocaleString()} <span className="text-xl">XOF</span>
                    </h3>
                    <p className="text-white/50 text-xs mt-2">
                        Inclut les commissions sur vos ventes depuis votre dernier rechargement
                    </p>
                </div>

                {/* Payment Action */}
                <div className="space-y-4">
                    <Button
                        onClick={() => window.open(wavePaymentLink, '_blank')}
                        className="w-full h-14 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold rounded-xl flex items-center justify-center gap-3"
                    >
                        <CreditCard size={20} />
                        Payer via Wave
                        <ExternalLink size={16} />
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-transparent text-white/40 text-xs uppercase tracking-widest">
                                Puis entrez l'ID
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Input
                            placeholder="ID Transaction Wave (17 caractères)"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            maxLength={17}
                            className="h-14 bg-white/5 border-white/10 text-white text-center font-mono text-lg tracking-widest placeholder:text-white/30"
                        />
                        <p className="text-white/40 text-xs text-center">
                            {transactionId.length}/17 caractères
                        </p>
                    </div>

                    <Button
                        onClick={handleDebtPayment}
                        disabled={transactionId.length !== 17 || submitting}
                        className="w-full h-14 bg-[#00FF41] hover:bg-[#00dd38] text-black font-black rounded-xl disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "Soumettre le Paiement"
                        )}
                    </Button>
                </div>

                {/* Grace Period Notice */}
                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-200/80 text-xs">
                    <p className="font-bold mb-1">⏱️ Note Importante</p>
                    <p>
                        Suite à cet incident, vos prochains rechargements seront soumis à une période de vérification manuelle de 24h.
                    </p>
                </div>

                {/* Support */}
                <div className="mt-6 text-center">
                    <p className="text-white/50 text-xs mb-3">Besoin d'aide?</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <Phone size={16} className="mr-2" />
                            Appeler
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <MessageCircle size={16} className="mr-2" />
                            Chat
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tawk.to widget remains active (injected via layout) */}
            <p className="mt-8 text-white/30 text-xs">
                {businessName} • Compte Suspendu
            </p>
        </div>
    );
}
