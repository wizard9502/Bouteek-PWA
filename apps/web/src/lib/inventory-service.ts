/**
 * Inventory Service - Centralized inventory management for all module types
 * 
 * Sale: Stock reservation with TTL
 * Rental: Calendar blocking for date ranges
 * Service: Time slot booking with staff/room availability
 */

import { supabase } from './supabaseClient';

// ============================================
// Types
// ============================================

export interface StockCheckResult {
    available: boolean;
    currentStock: number;
    requestedQuantity: number;
}

export interface StockReservation {
    id: string;
    listingId: string;
    variantId?: string;
    quantity: number;
    expiresAt: Date;
}

export interface RentalAvailability {
    available: boolean;
    conflictingDates?: string[];
}

export interface ServiceSlot {
    time: string;
    available: boolean;
    staffId?: string;
    staffName?: string;
}

export interface ServiceAvailability {
    date: string;
    slots: ServiceSlot[];
}

// ============================================
// Sale Module - Stock Management
// ============================================

/**
 * Check if sufficient stock is available for a sale item
 */
export async function checkSaleStock(
    listingId: string,
    quantity: number = 1,
    variantId?: string
): Promise<StockCheckResult> {
    const { data: listing, error } = await supabase
        .from('listings')
        .select('metadata')
        .eq('id', listingId)
        .single();

    if (error || !listing) {
        return { available: false, currentStock: 0, requestedQuantity: quantity };
    }

    const metadata = listing.metadata as any;

    // If variant specified, check variant stock
    if (variantId && metadata.variants) {
        const variant = metadata.variants.find((v: any) => v.id === variantId);
        const variantStock = variant?.stock ?? 0;
        return {
            available: variantStock >= quantity,
            currentStock: variantStock,
            requestedQuantity: quantity,
        };
    }

    // Otherwise check global stock level
    const stockLevel = metadata.stock_level ?? 0;
    return {
        available: stockLevel >= quantity,
        currentStock: stockLevel,
        requestedQuantity: quantity,
    };
}

/**
 * Reserve stock with a TTL (returns reservation ID for checkout)
 * Reservation expires after 15 minutes if not committed
 */
export async function reserveSaleStock(
    listingId: string,
    quantity: number = 1,
    variantId?: string,
    ttlMinutes: number = 15
): Promise<StockReservation | null> {
    // First check availability
    const available = await checkSaleStock(listingId, quantity, variantId);
    if (!available.available) {
        return null;
    }

    // Create reservation via RPC
    const { data, error } = await supabase.rpc('reserve_stock', {
        p_listing_id: listingId,
        p_variant_id: variantId || null,
        p_quantity: quantity,
        p_ttl_minutes: ttlMinutes,
    });

    if (error || !data) {
        console.error('Failed to reserve stock:', error);
        return null;
    }

    return {
        id: data.reservation_id,
        listingId,
        variantId,
        quantity,
        expiresAt: new Date(data.expires_at),
    };
}

/**
 * Commit a stock reservation (call after successful payment)
 */
export async function commitSaleStock(reservationId: string): Promise<boolean> {
    const { error } = await supabase.rpc('commit_stock_reservation', {
        p_reservation_id: reservationId,
    });

    if (error) {
        console.error('Failed to commit stock reservation:', error);
        return false;
    }

    return true;
}

/**
 * Release a stock reservation (call if checkout cancelled)
 */
export async function releaseSaleStock(reservationId: string): Promise<boolean> {
    const { error } = await supabase.rpc('release_stock_reservation', {
        p_reservation_id: reservationId,
    });

    if (error) {
        console.error('Failed to release stock reservation:', error);
        return false;
    }

    return true;
}

// ============================================
// Rental Module - Calendar Booking
// ============================================

/**
 * Check if a rental item is available for a date range
 */
export async function checkRentalAvailability(
    listingId: string,
    startDate: Date,
    endDate: Date
): Promise<RentalAvailability> {
    const { data: conflicts, error } = await supabase
        .from('rental_calendar')
        .select('booked_date')
        .eq('listing_id', listingId)
        .gte('booked_date', startDate.toISOString().split('T')[0])
        .lte('booked_date', endDate.toISOString().split('T')[0]);

    if (error) {
        console.error('Error checking rental availability:', error);
        return { available: false };
    }

    if (conflicts && conflicts.length > 0) {
        return {
            available: false,
            conflictingDates: conflicts.map(c => c.booked_date),
        };
    }

    return { available: true };
}

/**
 * Block dates for a rental booking
 */
export async function blockRentalDates(
    listingId: string,
    startDate: Date,
    endDate: Date,
    orderId: string
): Promise<boolean> {
    // Generate all dates in range
    const dates: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    // Insert blocked dates
    const { error } = await supabase.from('rental_calendar').insert(
        dates.map(date => ({
            listing_id: listingId,
            booked_date: date,
            order_id: orderId,
        }))
    );

    if (error) {
        console.error('Error blocking rental dates:', error);
        return false;
    }

    return true;
}

/**
 * Release blocked dates (for cancellation)
 */
export async function releaseRentalDates(orderId: string): Promise<boolean> {
    const { error } = await supabase
        .from('rental_calendar')
        .delete()
        .eq('order_id', orderId);

    if (error) {
        console.error('Error releasing rental dates:', error);
        return false;
    }

    return true;
}

/**
 * Get booked dates for a rental listing (for calendar display)
 */
export async function getRentalBookedDates(
    listingId: string,
    month: Date
): Promise<string[]> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data, error } = await supabase
        .from('rental_calendar')
        .select('booked_date')
        .eq('listing_id', listingId)
        .gte('booked_date', startOfMonth.toISOString().split('T')[0])
        .lte('booked_date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
        console.error('Error fetching booked dates:', error);
        return [];
    }

    return data?.map(d => d.booked_date) || [];
}

// ============================================
// Service Module - Appointment Slots
// ============================================

/**
 * Get available time slots for a service on a given date
 */
export async function getServiceAvailability(
    listingId: string,
    date: Date,
    staffId?: string
): Promise<ServiceAvailability> {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get listing metadata for availability schedule
    const { data: listing } = await supabase
        .from('listings')
        .select('metadata')
        .eq('id', listingId)
        .single();

    if (!listing) {
        return { date: dateStr, slots: [] };
    }

    const metadata = listing.metadata as any;
    const durationMinutes = metadata.duration_minutes || 60;

    // Get schedule for this day of week
    const daySchedule = metadata.availability?.[dayOfWeek.toLowerCase()] || [
        { start: '09:00', end: '17:00' } // Default business hours
    ];

    // Generate all possible slots
    const allSlots: string[] = [];
    for (const period of daySchedule) {
        const [startHour, startMin] = period.start.split(':').map(Number);
        const [endHour, endMin] = period.end.split(':').map(Number);
        let currentMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        while (currentMinutes + durationMinutes <= endMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const mins = currentMinutes % 60;
            allSlots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
            currentMinutes += durationMinutes + (metadata.buffer_time_after || 0);
        }
    }

    // Get existing bookings for this date
    let query = supabase
        .from('service_appointments')
        .select('time_slot, staff_id')
        .eq('listing_id', listingId)
        .eq('appointment_date', dateStr);

    if (staffId) {
        query = query.eq('staff_id', staffId);
    }

    const { data: existingBookings } = await query;

    // Get max bookings per slot
    const maxBookingsPerSlot = metadata.max_bookings_per_slot || 1;

    // Build availability map
    const bookingCounts: Record<string, number> = {};
    existingBookings?.forEach(booking => {
        const key = staffId ? booking.time_slot : `${booking.time_slot}-${booking.staff_id}`;
        bookingCounts[booking.time_slot] = (bookingCounts[booking.time_slot] || 0) + 1;
    });

    const slots: ServiceSlot[] = allSlots.map(time => ({
        time,
        available: (bookingCounts[time] || 0) < maxBookingsPerSlot,
    }));

    return { date: dateStr, slots };
}

/**
 * Book a service appointment slot
 */
export async function bookServiceSlot(
    listingId: string,
    date: Date,
    timeSlot: string,
    orderId: string,
    staffId?: string,
    customerId?: string
): Promise<string | null> {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('service_appointments')
        .insert({
            listing_id: listingId,
            appointment_date: dateStr,
            time_slot: timeSlot,
            order_id: orderId,
            staff_id: staffId || null,
            customer_id: customerId || null,
            status: 'confirmed',
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error booking service slot:', error);
        return null;
    }

    return data.id;
}

/**
 * Cancel a service appointment
 */
export async function cancelServiceAppointment(
    appointmentId: string
): Promise<boolean> {
    const { error } = await supabase
        .from('service_appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

    if (error) {
        console.error('Error cancelling appointment:', error);
        return false;
    }

    return true;
}

/**
 * Get staff availability for a service
 */
export async function getStaffForService(
    listingId: string
): Promise<{ id: string; name: string; avatarUrl?: string }[]> {
    // Get assigned staff IDs from listing metadata
    const { data: listing } = await supabase
        .from('listings')
        .select('metadata, store_id')
        .eq('id', listingId)
        .single();

    if (!listing) return [];

    const metadata = listing.metadata as any;
    const assignedStaffIds = metadata.assigned_staff_ids || [];

    if (assignedStaffIds.length === 0) {
        // Return all active staff if none specifically assigned
        const { data: allStaff } = await supabase
            .from('staff')
            .select('id, name, avatar_url')
            .eq('store_id', listing.store_id)
            .eq('is_active', true);

        return allStaff?.map(s => ({
            id: s.id,
            name: s.name,
            avatarUrl: s.avatar_url,
        })) || [];
    }

    // Get specific assigned staff
    const { data: staff } = await supabase
        .from('staff')
        .select('id, name, avatar_url')
        .in('id', assignedStaffIds)
        .eq('is_active', true);

    return staff?.map(s => ({
        id: s.id,
        name: s.name,
        avatarUrl: s.avatar_url,
    })) || [];
}

// ============================================
// Export unified interface
// ============================================

export const InventoryService = {
    // Sale
    checkSaleStock,
    reserveSaleStock,
    commitSaleStock,
    releaseSaleStock,

    // Rental
    checkRentalAvailability,
    blockRentalDates,
    releaseRentalDates,
    getRentalBookedDates,

    // Service
    getServiceAvailability,
    bookServiceSlot,
    cancelServiceAppointment,
    getStaffForService,
};

export default InventoryService;
