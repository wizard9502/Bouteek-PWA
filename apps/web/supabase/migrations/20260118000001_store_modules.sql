-- Migration: Store Modules & Bookings
-- 1. Add module toggles to storefronts table (assuming 1:1 with merchant for now)
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS enable_sales boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_rentals boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_services boolean DEFAULT false;

-- 2. Create Bookings table for Rentals and Services
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_type text NOT NULL, -- 'rental' or 'service'
  item_id uuid, -- Reference to a product if applicable (optional)
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for Bookings
CREATE POLICY "Merchants can view own bookings" ON public.bookings
  FOR SELECT USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update own bookings" ON public.bookings
  FOR UPDATE USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Public can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true); -- Allow customers to book
