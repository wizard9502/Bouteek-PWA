-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects
-- Allow public read
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated upload
CREATE POLICY "Merchant Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow owner delete
CREATE POLICY "Merchant Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
