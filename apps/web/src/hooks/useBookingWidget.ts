"use client";

import { useState, useEffect, useCallback } from 'react';
import { InventoryService } from '@/lib/inventory-service';

interface TimeSlot {
    time: string;
    available: boolean;
    staffId?: string;
    staffName?: string;
}

interface Staff {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface UseBookingWidgetOptions {
    listingId: string;
    moduleType: 'rental' | 'service';
    onBookingComplete?: (bookingDetails: any) => void;
}

/**
 * useBookingWidget - Connects BookingWidget to real availability data
 * 
 * Fetches real-time availability from InventoryService based on module type
 */
export function useBookingWidget(options: UseBookingWidgetOptions) {
    const { listingId, moduleType, onBookingComplete } = options;

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null); // For rentals
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [bookedDates, setBookedDates] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch staff list for service module
    useEffect(() => {
        if (moduleType === 'service') {
            InventoryService.getStaffForService(listingId).then(setStaffList);
        }
    }, [listingId, moduleType]);

    // Fetch booked dates for rental module (for calendar display)
    useEffect(() => {
        if (moduleType === 'rental' && selectedDate) {
            InventoryService.getRentalBookedDates(listingId, selectedDate).then(setBookedDates);
        }
    }, [listingId, moduleType, selectedDate]);

    // Fetch available slots when date or staff changes (service module)
    useEffect(() => {
        if (moduleType === 'service' && selectedDate) {
            setIsLoading(true);
            setError(null);

            InventoryService.getServiceAvailability(
                listingId,
                selectedDate,
                selectedStaff?.id
            )
                .then(availability => {
                    setAvailableSlots(availability.slots);
                })
                .catch(err => {
                    setError('Failed to load availability');
                    console.error(err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [listingId, moduleType, selectedDate, selectedStaff]);

    // Check rental availability
    const checkRentalAvailability = useCallback(async (start: Date, end: Date) => {
        if (moduleType !== 'rental') return null;

        setIsLoading(true);
        setError(null);

        try {
            const result = await InventoryService.checkRentalAvailability(listingId, start, end);
            if (!result.available) {
                setError(`Dates ${result.conflictingDates?.join(', ')} are not available`);
            }
            return result;
        } catch (err) {
            setError('Failed to check availability');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [listingId, moduleType]);

    // Select a date
    const selectDate = useCallback((date: Date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setError(null);
    }, []);

    // Select end date for rental
    const selectEndDate = useCallback(async (date: Date) => {
        if (selectedDate) {
            const availability = await checkRentalAvailability(selectedDate, date);
            if (availability?.available) {
                setSelectedEndDate(date);
            }
        }
    }, [selectedDate, checkRentalAvailability]);

    // Select a time slot
    const selectSlot = useCallback((slot: TimeSlot) => {
        if (slot.available) {
            setSelectedSlot(slot.time);
            setError(null);
        }
    }, []);

    // Select staff member
    const selectStaff = useCallback((staff: Staff | null) => {
        setSelectedStaff(staff);
        setSelectedSlot(null);
    }, []);

    // Check if selection is complete
    const isSelectionComplete = moduleType === 'rental'
        ? !!(selectedDate && selectedEndDate)
        : !!(selectedDate && selectedSlot);

    // Get booking summary
    const getBookingSummary = useCallback(() => {
        if (!isSelectionComplete) return null;

        if (moduleType === 'rental') {
            return {
                type: 'rental',
                startDate: selectedDate,
                endDate: selectedEndDate,
                days: Math.ceil((selectedEndDate!.getTime() - selectedDate!.getTime()) / (1000 * 60 * 60 * 24)) + 1,
            };
        } else {
            return {
                type: 'service',
                date: selectedDate,
                timeSlot: selectedSlot,
                staff: selectedStaff,
            };
        }
    }, [isSelectionComplete, moduleType, selectedDate, selectedEndDate, selectedSlot, selectedStaff]);

    // Reset selection
    const reset = useCallback(() => {
        setSelectedDate(null);
        setSelectedEndDate(null);
        setSelectedSlot(null);
        setSelectedStaff(null);
        setError(null);
    }, []);

    return {
        // State
        selectedDate,
        selectedEndDate,
        selectedSlot,
        selectedStaff,
        availableSlots,
        staffList,
        bookedDates,
        isLoading,
        error,
        isSelectionComplete,

        // Actions
        selectDate,
        selectEndDate,
        selectSlot,
        selectStaff,
        checkRentalAvailability,
        getBookingSummary,
        reset,
    };
}

export default useBookingWidget;
