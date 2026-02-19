-- Migration 014: Add subscription period tracking
-- Stores current_period_end from Stripe subscription for renewal/expiry display

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_period_start timestamptz DEFAULT NULL;

-- Index for querying expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_period_end
  ON profiles (subscription_period_end)
  WHERE subscription_period_end IS NOT NULL;
