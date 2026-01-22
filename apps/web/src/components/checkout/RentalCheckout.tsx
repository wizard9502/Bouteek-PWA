"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    Info,
    CreditCard,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { InventoryService } from "@/lib/inventory-service";
import { cn } from "@/lib/utils";

interface RentalCheckoutProps {
    listing: any;
    storefront: any;
    storeSlug?: string;
}

export function RentalCheckout({ listing, storefront, storeSlug }: RentalCheckoutProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [bookedDates, setBookedDates] = useState<string[]>([]);

    // Form state
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerIdNumber, setCustomerIdNumber] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<"orange_money" | "wave" | null>(null);
    const [transactionId, setTransactionId] = useState("");

    const metadata = listing?.metadata || {};
    const rentalUnit = metadata.rental_unit || "day";
    const depositAmount = metadata.deposit_amount || 0;
    const requireIdVerification = metadata.require_id_verification || false;

    // Fetch booked dates when month changes
    useEffect(() => {
        if (listing?.id) {
            InventoryService.getRentalBookedDates(listing.id, currentMonth)
                .then(setBookedDates);
        }
    }, [listing?.id, currentMonth]);

    // Calculate rental duration and total
    const calculateDuration = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const duration = calculateDuration();
    const rentalCost = duration * (listing?.price || listing?.base_price || 0);
    const totalAmount = rentalCost + depositAmount;

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateBooked = (date: Date) => {
        return bookedDates.includes(date.toISOString().split("T")[0]);
    };

    const isDateSelectable = (date: Date) => {
        return date >= today && !isDateBooked(date);
    };

    const isDateInRange = (date: Date) => {
        if (!startDate || !endDate) return false;
        return date > startDate && date < endDate;
    };

    const handleDateClick = (date: Date) => {
        if (!isDateSelectable(date)) return;

        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
        } else {
            if (date > startDate) {
                // Check if any dates in range are booked
                const hasConflict = bookedDates.some((bookedDate) => {
                    const d = new Date(bookedDate);
                    return d > startDate && d <= date;
                });

                if (hasConflict) {
                    toast.error("Selected range includes unavailable dates");
                    return;
                }

                setEndDate(date);
            } else {
                setStartDate(date);
            }
        }
    };

    const handleSubmit = async () => {
        if (!listing || !startDate || !endDate) return;

        if (!customerName.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!customerPhone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }
        if (requireIdVerification && !customerIdNumber.trim()) {
            toast.error("ID verification is required for this rental");
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
            // Check availability one more time
            const availability = await InventoryService.checkRentalAvailability(
                listing.id,
                startDate,
                endDate
            );

            if (!availability.available) {
                toast.error("These dates are no longer available");
                setIsSubmitting(false);
                return;
            }

            // Create order
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    merchant_id: listing.store_id,
                    listing_id: listing.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    total: totalAmount,
                    status: "pending_verification",
                    payment_method: selectedPayment,
                    transaction_id: transactionId,
                    metadata: {
                        module_type: "rental",
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        duration: duration,
                        rental_cost: rentalCost,
                        deposit_amount: depositAmount,
                        customer_id_number: customerIdNumber || null,
                    },
                })
                .select("id")
                .single();

            if (orderError) throw orderError;

            // Block the rental dates
            await InventoryService.blockRentalDates(
                listing.id,
                startDate,
                endDate,
                order.id
            );

            if ("vibrate" in navigator) navigator.vibrate([50, 50, 100]);
            setSuccess(true);
        } catch (error: any) {
            console.error("Error submitting rental order:", error);
            toast.error("Failed to submit order: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("fr-SN", {
            style: "currency",
            currency: "XOF",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
                <div className="text-center max-w-sm">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                    <h1 className="text-2xl font-black">Booking Submitted!</h1>
                    <p className="text-gray-600 mt-2">
                        Your rental booking has been received. The seller will verify your
                        payment and confirm your reservation.
                    </p>
                    <div className="mt-4 p-3 bg-white rounded-xl text-sm">
                        <p className="font-bold">
                            {startDate?.toLocaleDateString()} → {endDate?.toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">{duration} {rentalUnit}(s)</p>
                    </div>
                    <Link
                        href={storeSlug ? `/store/${storeSlug}` : "/"}
                        className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl font-bold"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const days = getDaysInMonth(currentMonth);
    const paymentMethods = storefront?.payment_methods;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
                <Link href={storeSlug ? `/store/${storeSlug}` : "/"}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="font-bold">Rental Booking</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-6">
                {/* Listing Summary */}
                <div className="bg-white rounded-2xl p-4 border flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        {listing.media_urls?.[0] && (
                            <img
                                src={listing.media_urls[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-1">
                            RENTAL
                        </span>
                        <h2 className="font-bold">{listing.title}</h2>
                        <p className="text-lg font-black text-indigo-600">
                            {formatPrice(listing.price || listing.base_price)}/{rentalUnit}
                        </p>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="bg-white rounded-2xl p-4 border">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Calendar size={18} />
                        Select Dates
                    </h3>

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                                )
                            }
                            className="p-2 hover:bg-muted rounded-full"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <p className="font-bold">
                            {currentMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <button
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                                )
                            }
                            className="p-2 hover:bg-muted rounded-full"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {days.map((date, index) => (
                            <button
                                key={index}
                                disabled={!date || !isDateSelectable(date)}
                                onClick={() => date && handleDateClick(date)}
                                className={cn(
                                    "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                                    !date && "invisible",
                                    date && !isDateSelectable(date) && "text-muted-foreground/30 cursor-not-allowed",
                                    date && isDateBooked(date) && "bg-red-100 text-red-400 line-through",
                                    date && isDateSelectable(date) && "hover:bg-muted",
                                    date && startDate?.toDateString() === date.toDateString() && "bg-indigo-600 text-white",
                                    date && endDate?.toDateString() === date.toDateString() && "bg-indigo-600 text-white",
                                    date && isDateInRange(date) && "bg-indigo-100"
                                )}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Selected summary */}
                    {startDate && (
                        <div className="bg-indigo-50 rounded-xl p-3 text-sm">
                            <p className="font-bold text-indigo-800">
                                {startDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}
                                {endDate && (
                                    <>
                                        {" → "}
                                        {endDate.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </>
                                )}
                            </p>
                            {endDate && (
                                <p className="text-indigo-600">
                                    {duration} {rentalUnit}(s)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pricing Breakdown */}
                {startDate && endDate && (
                    <div className="bg-white rounded-2xl p-4 border space-y-3">
                        <h3 className="font-bold">Price Breakdown</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    {formatPrice(listing.price || listing.base_price)} × {duration} {rentalUnit}(s)
                                </span>
                                <span>{formatPrice(rentalCost)}</span>
                            </div>
                            {depositAmount > 0 && (
                                <div className="flex justify-between text-amber-600">
                                    <span className="flex items-center gap-1">
                                        <Info size={14} />
                                        Security Deposit (refundable)
                                    </span>
                                    <span>{formatPrice(depositAmount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                )}

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

                    {requireIdVerification && (
                        <div className="space-y-2">
                            <Label htmlFor="idNumber" className="flex items-center gap-2">
                                <span>🪪</span> ID Number
                                <span className="text-xs text-amber-600 font-normal">(Required)</span>
                            </Label>
                            <Input
                                id="idNumber"
                                placeholder="National ID or Passport"
                                value={customerIdNumber}
                                onChange={(e) => setCustomerIdNumber(e.target.value)}
                                className="h-12"
                            />
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl p-4 border space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <CreditCard size={18} />
                        Payment Method
                    </h3>

                    {paymentMethods?.orange_money?.enabled && (
                        <button
                            onClick={() => setSelectedPayment("orange_money")}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                                selectedPayment === "orange_money"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200"
                            )}
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#ff7900] flex items-center justify-center text-white font-bold">
                                OM
                            </div>
                            <div>
                                <p className="font-bold">Orange Money</p>
                                <p className="text-sm text-gray-600 font-mono">
                                    {paymentMethods.orange_money.phone}
                                </p>
                            </div>
                        </button>
                    )}

                    {paymentMethods?.wave?.enabled && (
                        <button
                            onClick={() => setSelectedPayment("wave")}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                                selectedPayment === "wave"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200"
                            )}
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1da1f2] flex items-center justify-center text-white font-bold">
                                W
                            </div>
                            <div>
                                <p className="font-bold">Wave</p>
                                <p className="text-sm text-gray-600 font-mono">
                                    {paymentMethods.wave.phone}
                                </p>
                            </div>
                        </button>
                    )}
                </div>

                {/* Transaction ID */}
                {selectedPayment && (
                    <div className="bg-white rounded-2xl p-4 border space-y-4">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm">
                            <p className="font-bold text-yellow-800">Step 1: Send Payment</p>
                            <p className="text-yellow-700 mt-1">
                                Send <strong>{formatPrice(totalAmount)}</strong> to{" "}
                                <strong className="font-mono">
                                    {selectedPayment === "orange_money"
                                        ? paymentMethods?.orange_money?.phone
                                        : paymentMethods?.wave?.phone}
                                </strong>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="txid">
                                <span className="font-bold text-yellow-800">Step 2:</span> Enter
                                Transaction ID
                            </Label>
                            <Input
                                id="txid"
                                placeholder="e.g. MP230115.1234.A56789"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="h-12 font-mono"
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !startDate || !endDate || !selectedPayment || !transactionId}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Submitting...
                        </>
                    ) : (
                        `Confirm Rental • ${formatPrice(totalAmount)}`
                    )}
                </Button>
            </div>
        </div>
    );
}
