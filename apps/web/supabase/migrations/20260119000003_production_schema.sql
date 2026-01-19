-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    interval TEXT DEFAULT 'month', -- 'month', 'year'
    features JSONB DEFAULT '{}'::jsonb, -- e.g. {"heatmaps": true, "seo": false}
    limits JSONB DEFAULT '{}'::jsonb, -- e.g. {"products": 10, "staff": 1}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due'
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events Table (for Real Heatmaps)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'click', 'pageview', 'scroll'
    page_path TEXT,
    x_coord INTEGER,
    y_coord INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table (for Finance)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL, -- 'subscription', 'payout', 'fee'
    status TEXT DEFAULT 'completed',
    description TEXT,
    reference_id TEXT, -- external payment ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Plans
INSERT INTO plans (name, slug, price, features, limits)
VALUES 
    ('Starter', 'starter', 0, '{"heatmaps": false, "seo": false, "team": false, "custom_domain": false}', '{"products": 10, "staff": 1}'),
    ('Growth', 'growth', 15000, '{"heatmaps": true, "seo": true, "team": true, "custom_domain": false}', '{"products": 100, "staff": 3}'),
    ('Pro', 'pro', 45000, '{"heatmaps": true, "seo": true, "team": true, "custom_domain": true}', '{"products": -1, "staff": 10}')
ON CONFLICT (slug) DO UPDATE SET 
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    price = EXCLUDED.price;

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read plans" ON plans FOR SELECT USING (true);

CREATE POLICY "Merchants read own subscription" ON subscriptions 
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = merchant_id));

CREATE POLICY "Merchants read own analytics" ON analytics_events 
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = merchant_id));
CREATE POLICY "Public insert analytics" ON analytics_events 
    FOR INSERT WITH CHECK (true); -- Allow tracking from public storefronts

CREATE POLICY "Merchants read own transactions" ON transactions 
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = merchant_id));
