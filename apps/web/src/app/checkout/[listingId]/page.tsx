"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Phone, Loader2, CheckCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface Listing {
    id: string;
    title: string;
    price: number;
    currency: string;
    image_urls: string[];
    store_id: number;
}

interface PaymentMethod {
    phone: string;
    enabled: boolean;
}

interface Storefront {
    id: string;
    name: string;
    slug: string;
    payment_methods?: {
        orange_money?: PaymentMethod;
        wave?: PaymentMethod;
    };
}

export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const listingId = params.listingId as string;
    const storeSlug = searchParams.get("store");

    const [listing, setListing] = useState<Listing | null>(null);
    const [storefront, setStorefront] = useState<Storefront | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<"orange_money" | "wave" | null>(null);
    const [transactionId, setTransactionId] = useState("");

    useEffect(() => {
        loadData();
    }, [listingId, storeSlug]);

    const loadData = async () => {
        try {
            // Get listing
            const { data: listingData } = await supabase
                .from("listings")
                .select("*")
                .eq("id", listingId)
                .single();

            if (!listingData) {
                toast.error("Product not found");
                return;
            }

            setListing(listingData);

            // Get storefront
            if (storeSlug) {
                const { data: storefrontData } = await supabase
                    .from("storefronts")
                    .select("*")
                    .eq("slug", storeSlug)
                    .single();

                setStorefront(storefrontData);
            }
        } catch (error) {
            console.error("Error loading checkout data:", error);
            toast.error("Failed to load checkout");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!listing || !storefront) return;

        if (!customerName.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!customerPhone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }
        if (!selectedPayment) {
            toast.error("Please select a payment method");
            return;
        }
        if (!transactionId.trim()) {
            toast.error("Please enter the transaction ID");
            return;
        }

        setIsSubmitting(true);

        try {
            // Create order
            const { error } = await supabase
                .from("orders")
                .insert({
                    merchant_id: listing.store_id,
                    listing_id: listing.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    total: listing.price,
                    status: "pending_verification",
                    payment_method: selectedPayment,
                    transaction_id: transactionId,
                });

            if (error) throw error;

            // Haptic feedback
            if ("vibrate" in navigator) navigator.vibrate([50, 50, 100]);

            setSuccess(true);
        } catch (error: any) {
            console.error("Error submitting order:", error);
            toast.error("Failed to submit order: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("fr-SN", {
            style: "currency",
            currency: currency || "XOF",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto mb-4 text-gray-300" size={64} />
                    <h1 className="text-xl font-bold">Product not found</h1>
                    <Link href="/" className="text-blue-600 mt-2 block">
                        Go back
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
                <div className="text-center max-w-sm">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                    <h1 className="text-2xl font-black">Order Submitted!</h1>
                    <p className="text-gray-600 mt-2">
                        Your order has been received. The seller will verify your payment
                        and contact you shortly.
                    </p>
                    <Link
                        href={storeSlug ? `/store` : "/"}
                        className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-bold"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const paymentMethods = storefront?.payment_methods;
    const orangeEnabled = paymentMethods?.orange_money?.enabled;
    const waveEnabled = paymentMethods?.wave?.enabled;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
                <Link href={storeSlug ? `/store` : "/"}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="font-bold">Checkout</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-6">
                {/* Product Summary */}
                <div className="bg-white rounded-2xl p-4 border flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        {listing.image_urls?.[0] ? (
                            <img
                                src={listing.image_urls[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingCart size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold">{listing.title}</h2>
                        <p className="text-xl font-black text-green-600">
                            {formatPrice(listing.price, listing.currency)}
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl p-4 border space-y-4">
                    <h3 className="font-bold">Your Details</h3>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="+221 XX XXX XX XX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="h-12 font-mono"
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-4 border space-y-4">
                    <h3 className="font-bold">Payment Method</h3>

                    {orangeEnabled && (
                        <button
                            onClick={() => setSelectedPayment("orange_money")}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selectedPayment === "orange_money"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#ff7900] flex items-center justify-center">
                                <Phone className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="font-bold">Orange Money</p>
                                <p className="text-sm text-gray-600 font-mono">
                                    {paymentMethods?.orange_money?.phone}
                                </p>
                            </div>
                        </button>
                    )}

                    {waveEnabled && (
                        <button
                            onClick={() => setSelectedPayment("wave")}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selectedPayment === "wave"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1da1f2] flex items-center justify-center">
                                <Phone className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="font-bold">Wave</p>
                                <p className="text-sm text-gray-600 font-mono">
                                    {paymentMethods?.wave?.phone}
                                </p>
                            </div>
                        </button>
                    )}

                    {!orangeEnabled && !waveEnabled && (
                        <p className="text-gray-500 text-center py-4">
                            No payment methods configured
                        </p>
                    )}
                </div>

                {/* Transaction ID */}
                {selectedPayment && (
                    <div className="bg-white rounded-2xl p-4 border space-y-4">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm">
                            <p className="font-bold text-yellow-800">Step 1: Send Payment</p>
                            <p className="text-yellow-700 mt-1">
                                Send <strong>{formatPrice(listing.price, listing.currency)}</strong> to{" "}
                                <strong className="font-mono">
                                    {selectedPayment === "orange_money"
                                        ? paymentMethods?.orange_money?.phone
                                        : paymentMethods?.wave?.phone}
                                </strong>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="txid">
                                <span className="font-bold text-yellow-800">Step 2:</span> Enter Transaction ID
                            </Label>
                            <Input
                                id="txid"
                                placeholder="e.g. MP230115.1234.A56789"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="h-12 font-mono"
                            />
                            <p className="text-xs text-gray-500">
                                You'll receive this in your SMS confirmation
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedPayment || !transactionId}
                    className="w-full h-14 bg-black text-white font-black text-lg rounded-xl"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                    ) : null}
                    {isSubmitting ? "Submitting..." : "Submit Order"}
                </Button>

                <p className="text-xs text-center text-gray-400">
                    The seller will verify your payment and contact you to arrange delivery.
                </p>
            </div>
        </div>
    );
}
