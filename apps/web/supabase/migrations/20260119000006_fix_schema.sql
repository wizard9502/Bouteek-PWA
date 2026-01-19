-- Rename transactions to wallet_transactions if it exists, or create wallet_transactions
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    ALTER TABLE transactions RENAME TO wallet_transactions;
  ELSE
    CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type TEXT NOT NULL, -- 'subscription', 'payout', 'fee', 'topup', 'adjustment'
        status TEXT DEFAULT 'completed',
        description TEXT,
        reference_id TEXT, -- external payment ID
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- Add transaction_type column if it was named 'type' in 'transactions'
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'type') THEN
      ALTER TABLE wallet_transactions RENAME COLUMN type TO transaction_type;
  END IF;
END $$;

-- Create Storefronts Table
CREATE TABLE IF NOT EXISTS storefronts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_merchant_storefront UNIQUE (merchant_id) -- One storefront per merchant for now
);

-- Create Storefront Payment Methods
CREATE TABLE IF NOT EXISTS storefront_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storefront_id UUID REFERENCES storefronts(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'wave', 'orange_money', 'card', 'cash'
    details JSONB DEFAULT '{}'::jsonb, -- e.g. { "phoneNumber": "+221..." }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for Stores
CREATE POLICY "Public read storefronts" ON storefronts FOR SELECT USING (true);
CREATE POLICY "Merchants manage own storefront" ON storefronts 
    USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = merchant_id));

CREATE POLICY "Public read payment methods" ON storefront_payment_methods FOR SELECT USING (true);
CREATE POLICY "Merchants manage own payment methods" ON storefront_payment_methods 
    USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = (SELECT merchant_id FROM storefronts WHERE id = storefront_id)));

-- Policies for Wallet Transactions (if not already set)
DROP POLICY IF EXISTS "Merchants read own transactions" ON wallet_transactions;
CREATE POLICY "Merchants read own transactions" ON wallet_transactions 
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM merchants WHERE id = merchant_id));
