-- Migration: Inventory Engine
-- Creates tables and functions for stock reservations, rental calendar, and service appointments

-- ============================================
-- Stock Reservations Table (for Sale items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid, -- optional, for variant-specific stock
  quantity integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,
  committed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_listing ON public.stock_reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires ON public.stock_reservations(expires_at) WHERE committed = false;

-- Enable RLS
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reservations" ON public.stock_reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view own reservations" ON public.stock_reservations
  FOR SELECT USING (true);

-- ============================================
-- Rental Calendar Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.rental_calendar (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  booked_date date NOT NULL,
  order_id uuid, -- links to order that booked this date
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(listing_id, booked_date)
);

CREATE INDEX IF NOT EXISTS idx_rental_calendar_listing ON public.rental_calendar(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_calendar_date ON public.rental_calendar(booked_date);
CREATE INDEX IF NOT EXISTS idx_rental_calendar_order ON public.rental_calendar(order_id);

-- Enable RLS
ALTER TABLE public.rental_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rental calendar" ON public.rental_calendar
  FOR SELECT USING (true);

CREATE POLICY "Merchants can manage rental calendar" ON public.rental_calendar
  FOR ALL USING (
    listing_id IN (
      SELECT l.id FROM public.listings l
      JOIN public.merchants m ON l.store_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

-- ============================================
-- Service Appointments Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  appointment_date date NOT NULL,
  time_slot text NOT NULL, -- e.g., "09:00"
  staff_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  order_id uuid,
  customer_id uuid,
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_appointments_listing ON public.service_appointments(listing_id);
CREATE INDEX IF NOT EXISTS idx_service_appointments_date ON public.service_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_service_appointments_staff ON public.service_appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_service_appointments_order ON public.service_appointments(order_id);

-- Enable RLS
ALTER TABLE public.service_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view appointments" ON public.service_appointments
  FOR SELECT USING (true);

CREATE POLICY "Merchants can manage appointments" ON public.service_appointments
  FOR ALL USING (
    listing_id IN (
      SELECT l.id FROM public.listings l
      JOIN public.merchants m ON l.store_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

-- ============================================
-- RPC: Reserve Stock
-- ============================================
CREATE OR REPLACE FUNCTION public.reserve_stock(
  p_listing_id uuid,
  p_variant_id uuid DEFAULT NULL,
  p_quantity integer DEFAULT 1,
  p_ttl_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_id uuid;
  v_expires_at timestamptz;
  v_current_stock integer;
  v_active_reservations integer;
  v_available integer;
BEGIN
  -- Get current stock from listing metadata
  SELECT 
    CASE 
      WHEN p_variant_id IS NOT NULL THEN
        (COALESCE((metadata->'variants')::jsonb, '[]'::jsonb) -> 0 ->> 'stock')::integer
      ELSE
        COALESCE((metadata->>'stock_level')::integer, 0)
    END
  INTO v_current_stock
  FROM public.listings
  WHERE id = p_listing_id;
  
  IF v_current_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
  END IF;
  
  -- Count active (non-expired, non-committed) reservations
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_active_reservations
  FROM public.stock_reservations
  WHERE listing_id = p_listing_id
    AND (p_variant_id IS NULL OR variant_id = p_variant_id)
    AND committed = false
    AND expires_at > now();
  
  v_available := v_current_stock - v_active_reservations;
  
  IF v_available < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient stock',
      'available', v_available,
      'requested', p_quantity
    );
  END IF;
  
  -- Create reservation
  v_expires_at := now() + (p_ttl_minutes || ' minutes')::interval;
  
  INSERT INTO public.stock_reservations (listing_id, variant_id, quantity, expires_at)
  VALUES (p_listing_id, p_variant_id, p_quantity, v_expires_at)
  RETURNING id INTO v_reservation_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at
  );
END;
$$;

-- ============================================
-- RPC: Commit Stock Reservation
-- ============================================
CREATE OR REPLACE FUNCTION public.commit_stock_reservation(
  p_reservation_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing_id uuid;
  v_variant_id uuid;
  v_quantity integer;
BEGIN
  -- Get reservation details and mark as committed
  UPDATE public.stock_reservations
  SET committed = true
  WHERE id = p_reservation_id
    AND committed = false
    AND expires_at > now()
  RETURNING listing_id, variant_id, quantity
  INTO v_listing_id, v_variant_id, v_quantity;
  
  IF v_listing_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Actually deduct from listing metadata
  IF v_variant_id IS NOT NULL THEN
    -- Deduct from specific variant (complex JSONB update)
    -- For now, we track via reservations
    NULL;
  ELSE
    -- Deduct from stock_level
    UPDATE public.listings
    SET metadata = jsonb_set(
      metadata,
      '{stock_level}',
      to_jsonb(GREATEST(0, COALESCE((metadata->>'stock_level')::integer, 0) - v_quantity))
    )
    WHERE id = v_listing_id;
  END IF;
  
  RETURN true;
END;
$$;

-- ============================================
-- RPC: Release Stock Reservation
-- ============================================
CREATE OR REPLACE FUNCTION public.release_stock_reservation(
  p_reservation_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.stock_reservations
  WHERE id = p_reservation_id
    AND committed = false;
  
  RETURN FOUND;
END;
$$;

-- ============================================
-- Cleanup job: Remove expired reservations
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.stock_reservations
  WHERE expires_at < now()
    AND committed = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Trigger for service_appointments updated_at
DROP TRIGGER IF EXISTS update_service_appointments_updated_at ON public.service_appointments;
CREATE TRIGGER update_service_appointments_updated_at
  BEFORE UPDATE ON public.service_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
