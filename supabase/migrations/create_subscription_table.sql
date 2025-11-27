-- Create subscription table
CREATE TABLE IF NOT EXISTS subscription (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'pro', 'advanced', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on organization_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_organization_id ON subscription(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_razorpay_subscription_id ON subscription(razorpay_subscription_id);

-- Create default free subscriptions for existing organizations
INSERT INTO subscription (organization_id, plan_type, status)
SELECT id, 'free', 'active'
FROM organization
WHERE id NOT IN (SELECT organization_id FROM subscription)
ON CONFLICT (organization_id) DO NOTHING;

-- Add RLS policies
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;

-- Policy: Organizations can read their own subscription
CREATE POLICY "Organizations can read own subscription"
  ON subscription
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON subscription
  FOR ALL
  USING (auth.role() = 'service_role');
