import { supabase } from "@/lib/supabaseClient";
import UnverifiedScreen from "@/components/UnverifiedScreen";
import { Store } from "lucide-react";

export default async function StoreLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    const identifier = decodeURIComponent(domain);

    // Fetch essential status only (SSR friendly)
    // Note: We need to use service_role or ensure public access to 'is_verified'/'is_frozen' is allowed.
    // 'merchants' table usually has public read.
    // Fetch essential status only (SSR friendly)
    // Note: We need to use service_role or ensure public access to 'is_verified'/'is_frozen' is allowed.
    // 'merchants' table usually has public read.
    const { data: merchant, error } = await supabase
        .from("merchants")
        .select("*") // Use * to avoid error if explicit column 'business_name' is missing on remote
        .eq("slug", identifier)
        .single();

    if (error || !merchant) {
        // Let the page handle 404
        return <>{children}</>;
    }

    // 1. FREEZE CHECK (Hard Gate)
    if (merchant.is_frozen) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50 font-sans">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Store size={48} className="text-gray-400" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Store Temporarily Offline</h1>
                <p className="text-gray-500 max-w-md">
                    This store is currently unavailable. Please check back later.
                </p>
                <div className="mt-8 pt-8 border-t border-gray-200 w-full max-w-xs">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Powered by Bouteek</p>
                </div>
            </div>
        );
    }

    // 2. VERIFICATION CHECK (Hard Gate)
    if (!merchant.is_verified) {
        return <UnverifiedScreen businessName={merchant.business_name || merchant.name || "Store"} />;
    }

    // If all good, render children
    return <>{children}</>;
}
