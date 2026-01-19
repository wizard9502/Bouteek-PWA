-- Add low_stock_threshold to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Add custom_domain_status to storefronts
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS custom_domain_status TEXT DEFAULT 'pending'; -- pending, verified, failed

-- Add subscription_tier to merchants if not exists (it likely exists but good to ensure)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter';
