-- Allow public read access to plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to plans"
ON public.plans
FOR SELECT
TO public
USING (true);

-- Allow public read access to plans for anon role specifically if needed (Subapase usually covers this with public)
GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.plans TO authenticated;
GRANT SELECT ON public.plans TO service_role;
