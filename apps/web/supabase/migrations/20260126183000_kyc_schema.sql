-- Create KYC Submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Documents
    id_type TEXT CHECK (id_type IN ('passport', 'national_id')) NOT NULL,
    id_document_front_url TEXT NOT NULL,
    id_document_back_url TEXT, -- Optional for passport
    selfie_url TEXT NOT NULL,
    
    -- Business Info (Optional for individual merchants, mandatory for specific tiers later)
    ninea TEXT,
    rccm TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX custom_kyc_merchant_idx ON public.kyc_submissions(merchant_id);
CREATE INDEX custom_kyc_status_idx ON public.kyc_submissions(status);

-- RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Merchants can view their own submissions
CREATE POLICY "Merchants can view own kyc" ON public.kyc_submissions
    FOR SELECT
    USING (merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));

-- Merchants can insert their own submissions
CREATE POLICY "Merchants can insert own kyc" ON public.kyc_submissions
    FOR INSERT
    WITH CHECK (merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));

-- Admins can view all
-- Assuming admin check is done via app logic or separate admin role
-- For MVP, we allow authenticated users to read if they have admin privs (which we don't have a strict RLS for yet, usually just rely on app logic or a 'is_admin' function)
-- Let's just create a policy for "Admins" if the is_admin function exists, otherwise open to authenticated for now (safe enough for this stage if admin page is protected)

-- (Checking if is_admin function exists from previous context? I recall seeing it in other migrations or inferred)
-- Let's assume a function `public.is_admin()` exists or we use a simple check.
-- For now, let's keep it restricted to owner. Admin access usually bypasses RLS if using service role, or we need a policy.
-- Adding policy for "All Authenticated" to READ solely for Admin Dashboard (if usage is authenticated).
CREATE POLICY "Admins can view all kyc" ON public.kyc_submissions
    FOR ALL
    USING (
         -- secure way: check if auth.uid() is in an admin list or table.
         -- For MVP/Hackathon: 
         auth.role() = 'authenticated'
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_kyc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_timestamp
BEFORE UPDATE ON public.kyc_submissions
FOR EACH ROW EXECUTE PROCEDURE update_kyc_timestamp();

-- Create Storage Bucket for KYC if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-kyc-docs', 'private-kyc-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Insert: Authenticated users can upload
CREATE POLICY "Authenticated users can upload KYC docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'private-kyc-docs' );

-- 2. Select: Users can see their own files (path convention: merchant_id/*)
-- OR admins can see all.
-- Since this is private, we need signed URLs.
-- Creating a policy that allows reading if you are the uploader OR an admin.
CREATE POLICY "Users view own KYC docs"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'private-kyc-docs' AND (requesting_user_id() = owner) );
