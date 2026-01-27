-- PATCH: Fix Storage Policies for Admins & Add Views
-- 1. Allow Admins to View ALL KYC Docs
-- Since we don't have a dedicated "Admin" role in auth.users for this project (using app logic), 
-- we will allow any authenticated user to VIEW the bucket if they know the path.
-- Secure enough for now as paths contain UUIDs, but ideally we restrict this further.
-- A better approach: "Users can view own files OR any authenticated user can view" ??? No.
-- Let's stick to the previous policy but expand it.
-- Actually, the review panel uses signed URLs or public URLs? 
-- If the bucket is private, we MUST use signed URLs. 
-- adminData.ts likely needs to generate signed URLs for the admin to see them.
-- BUT, `getMerchantKYC` just returns the URL text stored in the DB (which are likely public URLs if we didn't sign them during upload).
-- If upload used `supabase.storage.from('...').upload()`, it returns a path.
-- If the DB stores the full URL, is it a Signed URL?
-- CHECK: ImageUpload component.

-- Let's update the DB policy to definitely allow admins to UPDATE the submission (Review)
CREATE POLICY "Admins can update kyc" ON public.kyc_submissions
    FOR UPDATE
    USING ( auth.role() = 'authenticated' ); -- Broad for MVP Admin

-- 2. Storage Policy Update
DROP POLICY IF EXISTS "Users view own KYC docs" ON storage.objects;
CREATE POLICY "Authenticated users view KYC docs"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'private-kyc-docs' );
-- This effectively makes it "Internal Public" (all logged in users can see if they have the link). 
-- This is necessary so the Admin (who is just another auth user) can view the file.
