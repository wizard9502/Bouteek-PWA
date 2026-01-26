-- Seed Default Plans if not exist
INSERT INTO public.plans (name, slug, price, commission_rate, features, limits)
VALUES 
    ('Starter', 'starter', 2000, 5.00, '{"basic_stats": true, "standard_seo": true, "audit_logs": false}', '{"products": 10, "images": 3}'),
    ('Launch', 'launch', 5000, 3.00, '{"basic_stats": true, "standard_seo": true, "customer_reviews": true, "promotions_engine": true}', '{"products": 50, "images": 5}'),
    ('Growth', 'growth', 12500, 1.50, '{"basic_stats": true, "standard_seo": true, "customer_reviews": true, "promotions_engine": true, "receipt_builder": true, "heatmaps": true}', '{"products": 200, "images": 10}'),
    ('Pro', 'pro', 20000, 0.75, '{"basic_stats": true, "standard_seo": true, "customer_reviews": true, "promotions_engine": true, "receipt_builder": true, "heatmaps": true, "audit_logs": true, "rbac": true}', '{"products": -1, "images": -1}')
ON CONFLICT (slug) DO UPDATE 
SET 
    price = EXCLUDED.price,
    commission_rate = EXCLUDED.commission_rate,
    features = public.plans.features || EXCLUDED.features; -- Merge features
