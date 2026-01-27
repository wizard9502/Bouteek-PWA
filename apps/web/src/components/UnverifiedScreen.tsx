"use client";

import { ShieldAlert, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnverifiedScreenProps {
    businessName: string;
}

export default function UnverifiedScreen({ businessName }: UnverifiedScreenProps) {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">

                {/* Icon */}
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto border-4 border-gray-800 shadow-2xl">
                    <Lock size={40} className="text-gray-500" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                        Store Temporarily Offline
                    </h1>
                    <p className="text-gray-400 font-medium">
                        The store <span className="text-white font-bold">{businessName}</span> is currently undergoing compliance verification.
                    </p>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Compliance Check in Progress</span>
                </div>

                {/* Divider */}
                <div className="w-16 h-1 bg-gray-800 rounded-full mx-auto" />

                {/* Footer */}
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    If you are the owner, please check your email or log in to the dashboard to complete the verification process.
                </p>

                <Button
                    variant="outline"
                    className="rounded-xl border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900"
                    onClick={() => window.location.href = 'https://bouteek.shop/login'} // Hardcoded to root
                >
                    Log in to Dashboard
                </Button>
            </div>
        </div>
    );
}
