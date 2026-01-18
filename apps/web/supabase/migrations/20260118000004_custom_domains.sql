-- Add Custom Domain support to Storefronts
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain_status text DEFAULT 'pending', -- pending, verified, failed
ADD COLUMN IF NOT EXISTS custom_domain_dns_record text; -- To store the specific verification value if needed

-- Add check to ensure domain format (basic check)
ALTER TABLE public.storefronts 
ADD CONSTRAINT custom_domain_check CHECK (custom_domain ~* '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$');
