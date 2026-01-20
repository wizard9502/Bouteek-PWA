"use client";

import React, { useState } from 'react';
import { BaseSectionProps, registerComponent } from '@/lib/store-builder/component-registry';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingWidgetConfig {
    mode: 'rental' | 'service';
    showTimeSlots: boolean;
    minDuration: number;
    maxDuration: number;
    title: string;
}

// Mock time slots
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
];

/**
 * BookingWidget - Date/time picker for rentals and services
 */
export function BookingWidget({ config, moduleType, isEditing }: BaseSectionProps) {
    const widgetConfig = config as BookingWidgetConfig;
    const mode = widgetConfig.mode || (moduleType === 'service' ? 'service' : 'rental');

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
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
        return date >= today;
    };

    const handleDateClick = (date: Date) => {
        if (!isDateSelectable(date)) return;

        if (mode === 'rental') {
            if (!selectedDate || (selectedDate && selectedEndDate)) {
                setSelectedDate(date);
                setSelectedEndDate(null);
            } else {
                if (date > selectedDate) {
                    setSelectedEndDate(date);
                } else {
                    setSelectedDate(date);
                }
            }
        } else {
            setSelectedDate(date);
        }
    };

    const isDateInRange = (date: Date) => {
        if (!selectedDate || !selectedEndDate) return false;
        return date > selectedDate && date < selectedEndDate;
    };

    return (
        <section className="py-12 px-6">
            <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-3xl border p-6 shadow-sm">
                    {/* Title */}
                    <h3 className="text-xl font-black mb-6 text-center">
                        {widgetConfig.title || (mode === 'rental' ? 'Select Dates' : 'Schedule Appointment')}
                    </h3>

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
                                    date && selectedDate?.toDateString() === date.toDateString() && "bg-black text-white",
                                    date && selectedEndDate?.toDateString() === date.toDateString() && "bg-black text-white",
                                    date && isDateInRange(date) && "bg-muted",
                                )}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Time Slots (for services) */}
                    {mode === 'service' && widgetConfig.showTimeSlots && selectedDate && (
                        <div className="space-y-4 mb-6">
                            <p className="text-sm font-bold flex items-center gap-2">
                                <Clock size={16} />
                                Available Times
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                {TIME_SLOTS.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={cn(
                                            "py-2 px-3 rounded-xl text-sm font-medium border transition-colors",
                                            selectedTime === time
                                                ? "bg-black text-white border-black"
                                                : "hover:border-black"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
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
                                {selectedTime && ` at ${selectedTime}`}
                            </p>
                        </div>
                    )}

                    {/* CTA */}
                    <Button
                        className="w-full h-12 rounded-2xl font-bold"
                        disabled={!selectedDate || (mode === 'service' && widgetConfig.showTimeSlots && !selectedTime)}
                    >
                        <Calendar className="mr-2" size={18} />
                        {mode === 'rental' ? 'Check Availability' : 'Book Now'}
                    </Button>
                </div>
            </div>
        </section>
    );
}

// Register component
registerComponent('booking_widget', BookingWidget);

export default BookingWidget;
