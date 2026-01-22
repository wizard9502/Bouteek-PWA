"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    User,
    CreditCard,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { InventoryService } from "@/lib/inventory-service";
import { cn } from "@/lib/utils";

interface ServiceCheckoutProps {
    listing: any;
    storefront: any;
    storeSlug?: string;
}

export function ServiceCheckout({ listing, storefront, storeSlug }: ServiceCheckoutProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [staff, setStaff] = useState<{ id: string; name: string; avatarUrl?: string }[]>([]);

    // Form state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<"orange_money" | "wave" | null>(null);
    const [transactionId, setTransactionId] = useState("");

    const metadata = listing?.metadata || {};
    const durationMinutes = metadata.duration_minutes || 60;
    const allowSpecialistSelection = metadata.allow_specialist_selection || false;

    // Fetch staff on mount
    useEffect(() => {
        if (listing?.id && allowSpecialistSelection) {
            InventoryService.getStaffForService(listing.id).then(setStaff);
        }
    }, [listing?.id, allowSpecialistSelection]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (listing?.id && selectedDate) {
            setLoadingSlots(true);
            InventoryService.getServiceAvailability(listing.id, selectedDate, selectedStaff || undefined)
                .then((result) => {
                    setAvailableSlots(result.slots);
                    setSelectedTime(null); // Reset time selection
                })
                .finally(() => setLoadingSlots(false));
        }
    }, [listing?.id, selectedDate, selectedStaff]);

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

    const isDateSelectable = (date: Date) => {
        return date >= today;
    };

    const handleDateClick = (date: Date) => {
        if (!isDateSelectable(date)) return;
        setSelectedDate(date);
    };

    const handleSubmit = async () => {
        if (!listing || !selectedDate || !selectedTime) return;

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
            // Create order first
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    merchant_id: listing.store_id,
                    listing_id: listing.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    total: listing.price || listing.base_price,
                    status: "pending_verification",
                    payment_method: selectedPayment,
                    transaction_id: transactionId,
                    metadata: {
                        module_type: "service",
                        appointment_date: selectedDate.toISOString(),
                        time_slot: selectedTime,
                        duration_minutes: durationMinutes,
                        staff_id: selectedStaff,
                        notes: notes || null,
                    },
                })
                .select("id")
                .single();

            if (orderError) throw orderError;

            // Book the time slot
            const appointmentId = await InventoryService.bookServiceSlot(
                listing.id,
                selectedDate,
                selectedTime,
                order.id,
                selectedStaff || undefined
            );

            if (!appointmentId) {
                toast.error("This time slot is no longer available");
                // Rollback order
                await supabase.from("orders").delete().eq("id", order.id);
                setIsSubmitting(false);
                return;
            }

            if ("vibrate" in navigator) navigator.vibrate([50, 50, 100]);
            setSuccess(true);
        } catch (error: any) {
            console.error("Error submitting service booking:", error);
            toast.error("Failed to submit booking: " + error.message);
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

    const formatDuration = (mins: number) => {
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
                <div className="text-center max-w-sm">
                    <CheckCircle className="mx-auto mb-4 text-pink-500" size={64} />
                    <h1 className="text-2xl font-black">Appointment Booked!</h1>
                    <p className="text-gray-600 mt-2">
                        Your appointment has been scheduled. You will receive a confirmation
                        once the payment is verified.
                    </p>
                    <div className="mt-4 p-3 bg-white rounded-xl text-sm">
                        <p className="font-bold">
                            {selectedDate?.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                        <p className="text-pink-600 font-bold text-lg">{selectedTime}</p>
                        <p className="text-gray-500">{formatDuration(durationMinutes)}</p>
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
                <h1 className="font-bold">Book Appointment</h1>
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
                        <span className="inline-block px-2 py-0.5 bg-pink-50 text-pink-600 text-xs font-bold rounded-full mb-1">
                            SERVICE
                        </span>
                        <h2 className="font-bold">{listing.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-black text-pink-600">
                                {formatPrice(listing.price || listing.base_price)}
                            </span>
                            <span className="text-sm text-gray-500">
                                • {formatDuration(durationMinutes)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Staff Selection */}
                {allowSpecialistSelection && staff.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <User size={18} />
                            Choose Specialist (optional)
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedStaff(null)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 min-w-[80px] transition-all",
                                    !selectedStaff
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-gray-200"
                                )}
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                <span className="text-xs font-medium">Any</span>
                            </button>
                            {staff.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStaff(s.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 min-w-[80px] transition-all",
                                        selectedStaff === s.id
                                            ? "border-pink-500 bg-pink-50"
                                            : "border-gray-200"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        {s.avatarUrl ? (
                                            <img
                                                src={s.avatarUrl}
                                                alt={s.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                                {s.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium truncate max-w-[70px]">
                                        {s.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date Selection */}
                <div className="bg-white rounded-2xl p-4 border">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Calendar size={18} />
                        Select Date
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
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, index) => (
                            <button
                                key={index}
                                disabled={!date || !isDateSelectable(date)}
                                onClick={() => date && handleDateClick(date)}
                                className={cn(
                                    "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                                    !date && "invisible",
                                    date && !isDateSelectable(date) && "text-muted-foreground/30 cursor-not-allowed",
                                    date && isDateSelectable(date) && "hover:bg-muted",
                                    date && selectedDate?.toDateString() === date.toDateString() && "bg-pink-500 text-white"
                                )}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                    <div className="bg-white rounded-2xl p-4 border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Clock size={18} />
                            Available Times
                        </h3>

                        {loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">
                                No available slots for this date
                            </p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={cn(
                                            "py-2 px-3 rounded-xl text-sm font-medium border transition-colors",
                                            !slot.available && "opacity-30 cursor-not-allowed line-through",
                                            selectedTime === slot.time
                                                ? "bg-pink-500 text-white border-pink-500"
                                                : "hover:border-pink-500"
                                        )}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
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

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Any special requests..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-12"
                        />
                    </div>
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
                                Send{" "}
                                <strong>
                                    {formatPrice(listing.price || listing.base_price)}
                                </strong>{" "}
                                to{" "}
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
                    disabled={isSubmitting || !selectedDate || !selectedTime || !selectedPayment || !transactionId}
                    className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white font-black text-lg rounded-xl"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Booking...
                        </>
                    ) : (
                        `Book Appointment • ${formatPrice(listing.price || listing.base_price)}`
                    )}
                </Button>
            </div>
        </div>
    );
}
