/**
 * Listing Schema Validator
 * 
 * Enhanced schema validation for listings with module-specific rules
 */

import { z } from 'zod';

// ============================================
// Base Schemas
// ============================================

const baseMetadataSchema = z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
});

// ============================================
// Sale Module Schema
// ============================================

const saleVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0).optional(),
    stock: z.number().min(0),
    sku: z.string().optional(),
    attributes: z.record(z.string()).optional(),
});

const saleMetadataSchema = baseMetadataSchema.extend({
    stock_level: z.number().min(0).default(0),
    sku: z.string().optional(),
    variants: z.array(saleVariantSchema).optional(),
    weight: z.number().optional(),
    dimensions: z.object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
    }).optional(),
});

// ============================================
// Rental Module Schema
// ============================================

const rentalMetadataSchema = baseMetadataSchema.extend({
    deposit_amount: z.number().min(0).default(0),
    deposit_percentage: z.number().min(0).max(100).optional(),
    rental_unit: z.enum(['hour', 'day', 'week', 'month']).default('day'),
    minimum_rental_period: z.number().min(1).default(1),
    maximum_rental_period: z.number().optional(),
    late_fee_per_day: z.number().min(0).optional(),
    requires_id_verification: z.boolean().default(false),
    pickup_instructions: z.string().optional(),
    return_instructions: z.string().optional(),
});

// ============================================
// Service Module Schema
// ============================================

const availabilityPeriodSchema = z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
});

const weeklyAvailabilitySchema = z.object({
    monday: z.array(availabilityPeriodSchema).optional(),
    tuesday: z.array(availabilityPeriodSchema).optional(),
    wednesday: z.array(availabilityPeriodSchema).optional(),
    thursday: z.array(availabilityPeriodSchema).optional(),
    friday: z.array(availabilityPeriodSchema).optional(),
    saturday: z.array(availabilityPeriodSchema).optional(),
    sunday: z.array(availabilityPeriodSchema).optional(),
});

const serviceMetadataSchema = baseMetadataSchema.extend({
    duration_minutes: z.number().min(5).default(60),
    buffer_time_before: z.number().min(0).default(0),
    buffer_time_after: z.number().min(0).default(0),
    max_bookings_per_slot: z.number().min(1).default(1),
    availability: weeklyAvailabilitySchema.optional(),
    assigned_staff_ids: z.array(z.string()).optional(),
    room_id: z.string().optional(),
    preparation_notes: z.string().optional(),
    cancellation_policy: z.string().optional(),
});

// ============================================
// Full Listing Schemas
// ============================================

const baseListingSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    price: z.number().min(0, 'Price must be positive'),
    currency: z.string().default('XOF'),
    media_urls: z.array(z.string().url()).min(1, 'At least one image is required'),
    category_id: z.string().optional(),
});

export const saleListingSchema = baseListingSchema.extend({
    module_type: z.literal('sale'),
    metadata: saleMetadataSchema,
});

export const rentalListingSchema = baseListingSchema.extend({
    module_type: z.literal('rental'),
    metadata: rentalMetadataSchema,
});

export const serviceListingSchema = baseListingSchema.extend({
    module_type: z.literal('service'),
    metadata: serviceMetadataSchema,
});

// ============================================
// Validation Functions
// ============================================

export type ValidationResult = {
    success: boolean;
    errors: Array<{
        path: string;
        message: string;
        code: string;
    }>;
    warnings: Array<{
        path: string;
        message: string;
    }>;
};

/**
 * Validate a listing before publishing
 */
export function validateListing(
    listing: any,
    moduleType: 'sale' | 'rental' | 'service'
): ValidationResult {
    let schema: z.ZodSchema;

    switch (moduleType) {
        case 'sale':
            schema = saleListingSchema;
            break;
        case 'rental':
            schema = rentalListingSchema;
            break;
        case 'service':
            schema = serviceListingSchema;
            break;
        default:
            return {
                success: false,
                errors: [{ path: 'module_type', message: 'Invalid module type', code: 'invalid_type' }],
                warnings: [],
            };
    }

    const result = schema.safeParse({
        ...listing,
        module_type: moduleType,
    });

    if (result.success) {
        // Add warnings for best practices
        const warnings: ValidationResult['warnings'] = [];

        if (!listing.metadata?.description) {
            warnings.push({
                path: 'metadata.description',
                message: 'Adding a description can help customers understand your offering',
            });
        }

        if (listing.media_urls?.length === 1) {
            warnings.push({
                path: 'media_urls',
                message: 'Adding more images can increase customer engagement',
            });
        }

        if (moduleType === 'sale' && !listing.metadata?.stock_level) {
            warnings.push({
                path: 'metadata.stock_level',
                message: 'Consider setting a stock level to enable inventory tracking',
            });
        }

        if (moduleType === 'rental' && !listing.metadata?.deposit_amount) {
            warnings.push({
                path: 'metadata.deposit_amount',
                message: 'Consider adding a security deposit for high-value items',
            });
        }

        if (moduleType === 'service' && !listing.metadata?.availability) {
            warnings.push({
                path: 'metadata.availability',
                message: 'Setting availability hours helps customers know when to book',
            });
        }

        return { success: true, errors: [], warnings };
    }

    return {
        success: false,
        errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
        })),
        warnings: [],
    };
}

/**
 * Get required fields for a module type
 */
export function getRequiredFields(moduleType: 'sale' | 'rental' | 'service'): string[] {
    const base = ['title', 'price', 'media_urls'];

    switch (moduleType) {
        case 'sale':
            return [...base];
        case 'rental':
            return [...base, 'metadata.rental_unit'];
        case 'service':
            return [...base, 'metadata.duration_minutes'];
        default:
            return base;
    }
}

/**
 * Get default metadata for a module type
 */
export function getDefaultMetadata(moduleType: 'sale' | 'rental' | 'service'): Record<string, any> {
    switch (moduleType) {
        case 'sale':
            return { stock_level: 0 };
        case 'rental':
            return {
                deposit_amount: 0,
                rental_unit: 'day',
                minimum_rental_period: 1,
                requires_id_verification: false,
            };
        case 'service':
            return {
                duration_minutes: 60,
                buffer_time_before: 0,
                buffer_time_after: 0,
                max_bookings_per_slot: 1,
            };
        default:
            return {};
    }
}

export default {
    validateListing,
    getRequiredFields,
    getDefaultMetadata,
    schemas: {
        sale: saleListingSchema,
        rental: rentalListingSchema,
        service: serviceListingSchema,
    },
};
