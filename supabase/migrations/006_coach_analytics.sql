-- 006_coach_analytics.sql
-- Add coach usage tracking + country to profiles for admin analytics

-- ── Coach usage tracking on profiles ────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_messages_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Index for admin queries: top coach users, filter by country
CREATE INDEX IF NOT EXISTS idx_profiles_coach_messages ON profiles(coach_messages_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- ── Atomic coach counter increment ──────────────────────────
CREATE OR REPLACE FUNCTION increment_coach_count(user_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET coach_messages_count = coach_messages_count + 1,
      updated_at = now()
  WHERE id = user_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
