-- Migration: Multi-Module Listing Engine
-- Creates unified listings table with polymorphic JSONB metadata
-- Also creates staff and rooms tables for service module

-- Module Type Enum
DO $$ BEGIN
  CREATE TYPE public.listing_module_enum AS ENUM ('sale', 'rental', 'service');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Rental Unit Enum
DO $$ BEGIN
  CREATE TYPE public.rental_unit_enum AS ENUM ('hour', 'day', 'week', 'month');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Unified Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  module_type public.listing_module_enum NOT NULL,
  
  -- Universal Fields
  title text NOT NULL,
  description text,
  base_price integer NOT NULL,
  media_urls jsonb DEFAULT '[]'::jsonb,
  video_url text,
  category text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  -- Polymorphic Metadata (JSONB)
  -- Sale: {variants: [{size, color, stock}], weight, shipping_rules, stock_level}
  -- Rental: {deposit_amount, rental_unit, min_period, max_period, late_fee_policy, late_fee_percentage, require_id_verification, insurance_info}
  -- Service: {duration_minutes, buffer_time_before, buffer_time_after, allow_specialist_selection, assigned_staff_ids, room_id, amenities_included, max_bookings_per_slot}
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_store ON public.listings(store_id);
CREATE INDEX IF NOT EXISTS idx_listings_module ON public.listings(module_type);
CREATE INDEX IF NOT EXISTS idx_listings_active ON public.listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_metadata ON public.listings USING gin(metadata);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Merchants can manage own listings" ON public.listings;

-- RLS Policies
CREATE POLICY "Public can view active listings" ON public.listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage own listings" ON public.listings
  FOR ALL USING (store_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  ));

-- Staff Table for Service Module
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role text,
  specialties text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_store ON public.staff(store_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active);

-- Enable RLS for staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active staff" ON public.staff;
DROP POLICY IF EXISTS "Merchants can manage own staff" ON public.staff;

CREATE POLICY "Public can view active staff" ON public.staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage own staff" ON public.staff
  FOR ALL USING (store_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  ));

-- Rooms/Booths Table for Service Module
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  capacity integer DEFAULT 1,
  amenities text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_store ON public.rooms(store_id);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON public.rooms(is_active);

-- Enable RLS for rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active rooms" ON public.rooms;
DROP POLICY IF EXISTS "Merchants can manage own rooms" ON public.rooms;

CREATE POLICY "Public can view active rooms" ON public.rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage own rooms" ON public.rooms
  FOR ALL USING (store_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  ));

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON public.staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
