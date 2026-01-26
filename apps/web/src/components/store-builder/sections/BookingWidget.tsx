"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingWidget } from '@/hooks/useBookingWidget';

interface BookingWidgetConfig {
    mode: 'rental' | 'service';
    showTimeSlots: boolean;
    minDuration: number;
    maxDuration: number;
    title: string;
    listingId?: string;
}

/**
 * BookingWidget - Date/time picker for rentals and services
 */
export function BookingWidget({ config, moduleType, isEditing }: BaseSectionProps) {
    const params = useParams();
    const router = useRouter();
    const widgetConfig = config as BookingWidgetConfig;
    const mode = widgetConfig.mode || (moduleType === 'service' ? 'service' : 'rental');

    // Determine listing ID from config or URL params
    const listingId = widgetConfig.listingId || (params?.listingId as string);

    const {
        selectedDate,
        selectedEndDate,
        selectedSlot,
        selectedStaff,
        availableSlots,
        bookedDates,
        isLoading,
        error,
        selectDate,
        selectEndDate,
        selectSlot,
        selectStaff, // Not used in UI yet but available
        checkRentalAvailability,
    } = useBookingWidget({
        listingId: listingId || '', // Pass empty string if missing, hook handles it gracefully (or won't fetch)
        moduleType: mode,
        onBookingComplete: (details) => {
            console.log('Booking attempt:', details);

            // Redirect to checkout with params
            if (isEditing) {
                alert(`In live mode, this would go to checkout for parameters: ${JSON.stringify(details, null, 2)}`);
                return;
            }

            const searchParams = new URLSearchParams();
            if (mode === 'service') {
                if (details.date) searchParams.set('date', details.date.toISOString());
                if (details.timeSlot) searchParams.set('time', details.timeSlot);
            } else {
                if (details.startDate) searchParams.set('startDate', details.startDate.toISOString());
                if (details.endDate) searchParams.set('endDate', details.endDate.toISOString());
            }

            // If we have a store slug in params, preserve it
            // Note: params.domain might exist if we are in store route
            // For now assuming we go to /checkout/[listingId]

            router.push(`/checkout/${listingId}?${searchParams.toString()}`);
        }
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate calendar days
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        // Add empty days for padding
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const isDateSelectable = (date: Date) => {
        if (date < today) return false;

        // For rentals, check if date is booked
        if (mode === 'rental' && contextBookedDates.includes(date.toISOString().split('T')[0])) {
            return false;
        }
        return true;
    };

    // Store booked dates in a standard format for easier lookup
    // The hook returns strings like "2023-10-25"
    const contextBookedDates = bookedDates;

    const handleDateClick = (date: Date) => {
        if (!isDateSelectable(date)) return;

        if (mode === 'rental') {
            if (!selectedDate || (selectedDate && selectedEndDate)) {
                selectDate(date);
            } else {
                if (date > selectedDate) {
                    selectEndDate(date);
                } else {
                    selectDate(date);
                }
            }
        } else {
            selectDate(date);
        }
    };

    const isDateInRange = (date: Date) => {
        if (!selectedDate || !selectedEndDate) return false;
        return date > selectedDate && date < selectedEndDate;
    };

    if (!listingId && !isEditing) {
        return (
            <div className="p-12 text-center text-muted-foreground bg-muted/20">
                Booking widget requires a listing context.
            </div>
        );
    }

    return (
        <section className="py-12 px-6">
            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-3xl border p-6 shadow-sm relative overflow-hidden">
                    {/* Title */}
                    <h3 className="text-xl font-black mb-6 text-center">
                        {widgetConfig.title || (mode === 'rental' ? 'Select Dates' : 'Schedule Appointment')}
                    </h3>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="p-2 hover:bg-muted rounded-full"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <p className="font-bold">{formatMonth(currentMonth)}</p>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="p-2 hover:bg-muted rounded-full"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Day Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-6">
                        {days.map((date, index) => {
                            const dateStr = date?.toISOString().split('T')[0];
                            const isBooked = date && contextBookedDates.includes(dateStr || '');
                            const selectable = date && isDateSelectable(date);

                            return (
                                <button
                                    key={index}
                                    disabled={!date || !selectable}
                                    onClick={() => date && handleDateClick(date)}
                                    className={cn(
                                        "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors relative",
                                        !date && "invisible",
                                        date && !selectable && "text-muted-foreground/30 cursor-not-allowed",
                                        date && isBooked && "bg-red-50 text-red-300 line-through", // Visual indication of booked
                                        date && selectable && "hover:bg-muted",
                                        date && selectedDate?.toDateString() === date.toDateString() && "bg-primary text-primary-foreground hover:bg-primary",
                                        date && selectedEndDate?.toDateString() === date.toDateString() && "bg-primary text-primary-foreground hover:bg-primary",
                                        date && isDateInRange(date) && "bg-primary/10 text-primary-foreground",
                                    )}
                                >
                                    {date?.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Time Slots (for services) */}
                    {mode === 'service' && widgetConfig.showTimeSlots && selectedDate && (
                        <div className="space-y-4 mb-6">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <Clock size={16} />
                                Available Times
                                {isLoading && <Loader2 size={14} className="animate-spin ml-2" />}
                            </p>

                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {availableSlots.map(slot => (
                                        <button
                                            key={slot.time}
                                            onClick={() => selectSlot(slot)}
                                            disabled={!slot.available}
                                            className={cn(
                                                "py-2 px-3 rounded-xl text-sm font-medium border transition-colors",
                                                !slot.available && "opacity-50 cursor-not-allowed bg-muted/50",
                                                selectedSlot === slot.time
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "hover:border-foreground"
                                            )}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic p-4 text-center bg-muted/30 rounded-xl">
                                    {isLoading ? 'Loading slots...' : 'No available slots for this date'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selected Summary */}
                    {selectedDate && (
                        <div className="bg-muted/50 rounded-2xl p-4 mb-4 text-sm">
                            <p className="font-bold mb-1">
                                {mode === 'rental' ? 'Selected Period' : 'Selected Date'}
                            </p>
                            <p className="text-muted-foreground">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {selectedEndDate && ` → ${selectedEndDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                                {selectedSlot && ` at ${selectedSlot}`}
                            </p>
                        </div>
                    )}

                    {/* CTA */}
                    <Button
                        className="w-full h-12 rounded-2xl font-bold"
                        disabled={
                            isLoading ||
                            !selectedDate ||
                            (mode === 'service' && widgetConfig.showTimeSlots && !selectedSlot) ||
                            (mode === 'rental' && (!selectedDate || !selectedEndDate))
                        }
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 animate-spin" size={18} />
                        ) : (
                            <Calendar className="mr-2" size={18} />
                        )}
                        {mode === 'rental' ? 'Check Availability & Book' : 'Book Now'}
                    </Button>
                </div>
            </div>
        </section>
    );
}

// Register component
registerComponent('booking_widget', BookingWidget);

export default BookingWidget;
