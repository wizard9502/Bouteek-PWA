import { z } from 'zod';

// ============================================
// Base Listing Schema (shared by all modules)
// ============================================
export const baseListingSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(2000).optional(),
    base_price: z.number().positive('Price must be positive'),
    video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
    media_urls: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').default([]),
    category: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
});

// ============================================
// Sale Module Schema
// ============================================
export const saleVariantSchema = z.object({
    id: z.string().uuid().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    price_adjustment: z.number().optional(), // +/- from base price
});

export const saleMetadataSchema = z.object({
    variants: z.array(saleVariantSchema).default([]),
    weight: z.number().min(0).optional(), // in grams
    stock_level: z.number().int().min(0).default(0),
    shipping_rules: z.object({
        free_shipping_threshold: z.number().optional(),
        flat_rate: z.number().optional(),
        per_kg_rate: z.number().optional(),
    }).optional(),
});

export const saleListingSchema = baseListingSchema.extend({
    module_type: z.literal('sale'),
    metadata: saleMetadataSchema,
});

// ============================================
// Rental Module Schema
// ============================================
export const rentalMetadataSchema = z.object({
    deposit_amount: z.number().min(0, 'Deposit cannot be negative'),
    rental_unit: z.enum(['hour', 'day', 'week', 'month']),
    min_period: z.number().int().min(1, 'Minimum period must be at least 1'),
    max_period: z.number().int().optional(),
    late_fee_policy: z.string().max(500).optional(),
    late_fee_percentage: z.number().min(0).max(100).optional(),
    require_id_verification: z.boolean().default(false),
    insurance_info: z.string().max(500).optional(),
    availability_calendar: z.array(z.object({
        date: z.string(),
        available: z.boolean(),
    })).optional(),
});

export const rentalListingSchema = baseListingSchema.extend({
    module_type: z.literal('rental'),
    metadata: rentalMetadataSchema,
});

// ============================================
// Service Module Schema
// ============================================
export const serviceMetadataSchema = z.object({
    duration_minutes: z.number().int().min(15, 'Duration must be at least 15 minutes'),
    buffer_time_before: z.number().int().min(0).default(0),
    buffer_time_after: z.number().int().min(0).default(0),
    allow_specialist_selection: z.boolean().default(false),
    assigned_staff_ids: z.array(z.string().uuid()).default([]),
    room_id: z.string().uuid().optional(),
    amenities_included: z.array(z.string()).default([]),
    max_bookings_per_slot: z.number().int().min(1).default(1),
    availability: z.object({
        monday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        tuesday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        wednesday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        thursday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        friday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        saturday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        sunday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    }).optional(),
});

export const serviceListingSchema = baseListingSchema.extend({
    module_type: z.literal('service'),
    metadata: serviceMetadataSchema,
});

// ============================================
// Union Schema for any listing type
// ============================================
export const listingSchema = z.discriminatedUnion('module_type', [
    saleListingSchema,
    rentalListingSchema,
    serviceListingSchema,
]);

// ============================================
// Type exports
// ============================================
export type ModuleType = 'sale' | 'rental' | 'service';
export type BaseListing = z.infer<typeof baseListingSchema>;
export type SaleVariant = z.infer<typeof saleVariantSchema>;
export type SaleMetadata = z.infer<typeof saleMetadataSchema>;
export type SaleListing = z.infer<typeof saleListingSchema>;
export type RentalMetadata = z.infer<typeof rentalMetadataSchema>;
export type RentalListing = z.infer<typeof rentalListingSchema>;
export type ServiceMetadata = z.infer<typeof serviceMetadataSchema>;
export type ServiceListing = z.infer<typeof serviceListingSchema>;
export type Listing = z.infer<typeof listingSchema>;

// ============================================
// Default metadata by module type
// ============================================
export const getDefaultMetadata = (moduleType: ModuleType) => {
    switch (moduleType) {
        case 'sale':
            return {
                variants: [],
                stock_level: 0,
                weight: undefined,
                shipping_rules: undefined,
            } satisfies SaleMetadata;
        case 'rental':
            return {
                deposit_amount: 0,
                rental_unit: 'day' as const,
                min_period: 1,
                max_period: undefined,
                late_fee_policy: undefined,
                late_fee_percentage: undefined,
                require_id_verification: false,
                insurance_info: undefined,
            } satisfies RentalMetadata;
        case 'service':
            return {
                duration_minutes: 60,
                buffer_time_before: 0,
                buffer_time_after: 0,
                allow_specialist_selection: false,
                assigned_staff_ids: [],
                room_id: undefined,
                amenities_included: [],
                max_bookings_per_slot: 1,
            } satisfies ServiceMetadata;
    }
};

// ============================================
// Validation helper
// ============================================
export const validateListing = (data: unknown) => {
    return listingSchema.safeParse(data);
};

export const validateSaleListing = (data: unknown) => {
    return saleListingSchema.safeParse(data);
};

export const validateRentalListing = (data: unknown) => {
    return rentalListingSchema.safeParse(data);
};

export const validateServiceListing = (data: unknown) => {
    return serviceListingSchema.safeParse(data);
};
