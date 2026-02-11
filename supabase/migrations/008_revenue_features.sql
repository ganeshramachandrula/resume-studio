-- ============================================================
-- Revenue Features Migration
-- Adds: teams table, affiliate_clicks table,
--        credits + team_id on profiles, updated plan CHECK,
--        updated usage/application functions, add_credits()
-- ============================================================

-- ── 1. Create teams table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  seat_count INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_teams_admin_user_id ON teams(admin_user_id);


-- ── 2. Update profiles table ───────────────────────────────
-- Add credits and team_id columns (must come before teams policies that reference team_id)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);

-- Update plan CHECK constraint to include 'team'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro_monthly', 'pro_annual', 'team'));


-- ── 3. Teams RLS policies (after profiles.team_id exists) ──
CREATE POLICY "team_admin_select" ON teams
  FOR SELECT USING (admin_user_id = auth.uid());
CREATE POLICY "team_admin_update" ON teams
  FOR UPDATE USING (admin_user_id = auth.uid());

-- Team members can read their team
CREATE POLICY "team_member_select" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM profiles WHERE id = auth.uid() AND team_id IS NOT NULL)
  );


-- ── 4. Create affiliate_clicks table ───────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service role only (no user-facing policies)
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_partner_id ON affiliate_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);


-- ── 5. Update check_and_increment_usage() ──────────────────
-- Add 'team' to pro plans list + credit consumption for free users at limit

CREATE OR REPLACE FUNCTION check_and_increment_usage(
  user_uuid UUID,
  max_free_usage INT DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_usage INT;
  v_credits INT;
  v_reset_date TIMESTAMPTZ;
BEGIN
  -- Lock the row to prevent concurrent requests from racing
  SELECT plan, usage_count, usage_reset_at, credits
  INTO v_plan, v_usage, v_reset_date, v_credits
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'usage_count', 0, 'reason', 'profile_not_found');
  END IF;

  -- Monthly reset: if we're past the reset date, reset the counter
  IF v_reset_date IS NOT NULL AND NOW() > v_reset_date THEN
    v_usage := 0;
    UPDATE profiles
    SET usage_count = 0,
        usage_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE id = user_uuid;
  END IF;

  -- Pro/Team users: always allowed, still increment for analytics
  IF v_plan IN ('pro_monthly', 'pro_annual', 'team') THEN
    UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
    RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'pro_plan');
  END IF;

  -- Free users: check limit
  IF v_usage >= max_free_usage THEN
    -- Check if user has credits to spend
    IF v_credits > 0 THEN
      UPDATE profiles
      SET usage_count = v_usage + 1,
          credits = credits - 1
      WHERE id = user_uuid;
      RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'credit_used', 'credits_remaining', v_credits - 1);
    END IF;
    RETURN jsonb_build_object('allowed', false, 'usage_count', v_usage, 'reason', 'limit_reached');
  END IF;

  -- Increment and allow
  UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
  RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'allowed');
END;
$$;


-- ── 6. Update check_application_limit() ────────────────────
-- Add 'team' to pro plans, allow save for credit users

CREATE OR REPLACE FUNCTION check_application_limit(
  user_uuid UUID,
  job_description_uuid UUID,
  max_applications INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_credits INT;
  v_saved_count INT;
  v_existing_docs INT;
BEGIN
  SELECT plan, saved_applications_count, credits
  INTO v_plan, v_saved_count, v_credits
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'profile_not_found');
  END IF;

  -- Free users without credits: always allowed to generate (preview only, not saved)
  IF v_plan NOT IN ('pro_monthly', 'pro_annual', 'team') AND v_credits <= 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'free_preview');
  END IF;

  -- Free users WITH credits: allow save (same as pro logic below)
  -- Pro/Team: check if this JD already has docs for this user
  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = user_uuid AND job_description_id = job_description_uuid;

  IF v_existing_docs > 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'existing_application');
  END IF;

  -- Pro/Team: check application limit
  IF v_saved_count >= max_applications THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'application_limit_reached',
      'current_count', v_saved_count,
      'max', max_applications
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'reason', 'allowed');
END;
$$;


-- ── 7. add_credits() ───────────────────────────────────────
-- Atomic credit addition

CREATE OR REPLACE FUNCTION add_credits(
  user_uuid UUID,
  credit_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_credits INT;
BEGIN
  UPDATE profiles
  SET credits = credits + credit_amount
  WHERE id = user_uuid
  RETURNING credits INTO v_new_credits;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'profile_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'credits', v_new_credits);
END;
$$;
