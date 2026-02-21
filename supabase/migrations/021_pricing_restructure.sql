-- ============================================================
-- Pricing Restructure Migration
-- Simplify from 4 plans (free/pro_monthly/pro_annual/team)
-- to 3 plans (free/basic/pro) with generation limits on all.
-- ============================================================

-- ── 1. Drop old CHECK constraint first (before migrating data) ──
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- ── 2. Migrate existing users ────────────────────────────────
-- pro_monthly → basic, pro_annual → pro, team → pro
UPDATE profiles SET plan = 'basic' WHERE plan = 'pro_monthly';
UPDATE profiles SET plan = 'pro' WHERE plan = 'pro_annual';
UPDATE profiles SET plan = 'pro' WHERE plan = 'team';

-- Clear team_id on all profiles (teams no longer used)
UPDATE profiles SET team_id = NULL WHERE team_id IS NOT NULL;

-- ── 3. Add new CHECK constraint ──────────────────────────────
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'basic', 'pro'));

-- ── 3. Rewrite check_and_increment_usage() ──────────────────
-- All plans now have limits: free=2, basic=10, pro=20
-- Credits still work the same for any plan that hits its limit

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
  v_limit INT;
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

  -- Determine plan limit
  IF v_plan = 'pro' THEN
    v_limit := 20;
  ELSIF v_plan = 'basic' THEN
    v_limit := 10;
  ELSE
    v_limit := max_free_usage; -- defaults to 2
  END IF;

  -- Check if under limit
  IF v_usage < v_limit THEN
    UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
    RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'allowed', 'limit', v_limit);
  END IF;

  -- At or over limit: check if user has credits to spend
  IF v_credits > 0 THEN
    UPDATE profiles
    SET usage_count = v_usage + 1,
        credits = credits - 1
    WHERE id = user_uuid;
    RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'credit_used', 'credits_remaining', v_credits - 1);
  END IF;

  RETURN jsonb_build_object('allowed', false, 'usage_count', v_usage, 'reason', 'limit_reached', 'limit', v_limit);
END;
$$;


-- ── 4. Rewrite check_application_limit() ────────────────────
-- Update plan name checks for new plan names

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
  IF v_plan NOT IN ('basic', 'pro') AND v_credits <= 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'free_preview');
  END IF;

  -- Free users WITH credits: allow save (same as paid logic below)
  -- Basic/Pro: check if this JD already has docs for this user
  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = user_uuid AND job_description_id = job_description_uuid;

  IF v_existing_docs > 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'existing_application');
  END IF;

  -- Paid: check application limit
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
