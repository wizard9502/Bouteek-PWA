"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SuspensionScreen from "./SuspensionScreen";

interface SuspensionGuardProps {
    children: ReactNode;
}

interface MerchantStatus {
    id: string;
    account_status: 'active' | 'suspended';
    is_restricted: boolean;
    debt_amount: number;
    business_name: string;
}

export default function SuspensionGuard({ children }: SuspensionGuardProps) {
    const [loading, setLoading] = useState(true);
    const [merchantStatus, setMerchantStatus] = useState<MerchantStatus | null>(null);

    useEffect(() => {
        fetchMerchantStatus();

        // Subscribe to realtime changes on merchant status
        const subscription = supabase
            .channel('merchant-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'merchants',
                    filter: merchantStatus ? `id=eq.${merchantStatus.id}` : undefined
                },
                (payload) => {
                    if (payload.new) {
                        setMerchantStatus(payload.new as MerchantStatus);
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [merchantStatus?.id]);

    const fetchMerchantStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: merchant, error } = await supabase
                .from('merchants')
                .select('id, account_status, is_restricted, debt_amount, business_name')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching merchant status:', error);
                setLoading(false);
                return;
            }

            setMerchantStatus(merchant);
        } catch (err) {
            console.error('Suspension guard error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Still loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full" />
            </div>
        );
    }

    // Not a merchant (maybe admin or regular user) - allow access
    if (!merchantStatus) {
        return <>{children}</>;
    }

    // Merchant is suspended - show suspension screen
    if (merchantStatus.account_status === 'suspended') {
        return (
            <SuspensionScreen
                debtAmount={merchantStatus.debt_amount || 0}
                businessName={merchantStatus.business_name}
                merchantId={merchantStatus.id}
                onPaymentSubmitted={fetchMerchantStatus}
            />
        );
    }

    // Active merchant - render children normally
    return <>{children}</>;
}
