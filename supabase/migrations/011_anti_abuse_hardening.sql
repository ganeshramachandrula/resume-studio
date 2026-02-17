-- Migration 011: Anti-Abuse Hardening
-- Adds signup tracking columns, daily usage counters for parse-jd and ats-score,
-- and RPC functions for atomic rate gating and signup limits.

-- ── New columns on profiles ──────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS signup_ip TEXT,
  ADD COLUMN IF NOT EXISTS signup_device_id TEXT,
  ADD COLUMN IF NOT EXISTS signup_referrer TEXT,
  ADD COLUMN IF NOT EXISTS signup_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS parse_jd_daily_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parse_jd_reset_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ats_score_daily_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ats_score_reset_at TIMESTAMPTZ DEFAULT now();

-- Indexes for signup abuse checks
CREATE INDEX IF NOT EXISTS idx_profiles_signup_ip ON profiles (signup_ip) WHERE signup_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_signup_device_id ON profiles (signup_device_id) WHERE signup_device_id IS NOT NULL;

-- ── RPC: check_and_increment_parse_jd ────────────────────────────
-- Atomic daily gate for parse-jd. Resets counter after 24h.
-- Returns JSON {allowed: bool, remaining: int, limit: int}

CREATE OR REPLACE FUNCTION check_and_increment_parse_jd(
  p_user_id UUID,
  p_max_daily INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
  v_reset_at TIMESTAMPTZ;
  v_limit INT;
BEGIN
  v_limit := p_max_daily;

  -- Get current state with row lock
  SELECT parse_jd_daily_count, parse_jd_reset_at
  INTO v_count, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Reset counter if more than 24h since last reset
  IF v_reset_at IS NULL OR now() - v_reset_at > INTERVAL '24 hours' THEN
    UPDATE profiles
    SET parse_jd_daily_count = 1, parse_jd_reset_at = now()
    WHERE id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'limit', v_limit);
  END IF;

  -- Check limit
  IF v_count >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_limit);
  END IF;

  -- Increment
  UPDATE profiles
  SET parse_jd_daily_count = parse_jd_daily_count + 1
  WHERE id = p_user_id;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - v_count - 1, 'limit', v_limit);
END;
$$;

-- ── RPC: check_and_increment_ats_score ───────────────────────────
-- Same pattern for ats-score route.

CREATE OR REPLACE FUNCTION check_and_increment_ats_score(
  p_user_id UUID,
  p_max_daily INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
  v_reset_at TIMESTAMPTZ;
  v_limit INT;
BEGIN
  v_limit := p_max_daily;

  SELECT ats_score_daily_count, ats_score_reset_at
  INTO v_count, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_reset_at IS NULL OR now() - v_reset_at > INTERVAL '24 hours' THEN
    UPDATE profiles
    SET ats_score_daily_count = 1, ats_score_reset_at = now()
    WHERE id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'limit', v_limit);
  END IF;

  IF v_count >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_limit);
  END IF;

  UPDATE profiles
  SET ats_score_daily_count = ats_score_daily_count + 1
  WHERE id = p_user_id;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - v_count - 1, 'limit', v_limit);
END;
$$;

-- ── RPC: check_signup_allowed ────────────────────────────────────
-- Checks if a new signup is allowed from the given IP/device.
-- Free accounts: max 1 per IP, max 1 per device.
-- Total accounts (free + paid): max 4 per IP, max 4 per device.

CREATE OR REPLACE FUNCTION check_signup_allowed(
  p_ip TEXT,
  p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_free_by_ip INT;
  v_free_by_device INT;
  v_total_by_ip INT;
  v_total_by_device INT;
BEGIN
  -- Count free accounts by IP
  SELECT COUNT(*) INTO v_free_by_ip
  FROM profiles
  WHERE signup_ip = p_ip AND plan = 'free';

  -- Count free accounts by device
  IF p_device_id IS NOT NULL AND p_device_id != '' THEN
    SELECT COUNT(*) INTO v_free_by_device
    FROM profiles
    WHERE signup_device_id = p_device_id AND plan = 'free';
  ELSE
    v_free_by_device := 0;
  END IF;

  -- Block if 1+ free accounts already exist from same IP or device
  IF v_free_by_ip >= 1 OR v_free_by_device >= 1 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'A free account already exists from this network or device.'
    );
  END IF;

  -- Count total accounts by IP
  SELECT COUNT(*) INTO v_total_by_ip
  FROM profiles
  WHERE signup_ip = p_ip;

  -- Count total accounts by device
  IF p_device_id IS NOT NULL AND p_device_id != '' THEN
    SELECT COUNT(*) INTO v_total_by_device
    FROM profiles
    WHERE signup_device_id = p_device_id;
  ELSE
    v_total_by_device := 0;
  END IF;

  -- Block if 4+ total accounts from same IP or device
  IF v_total_by_ip >= 4 OR v_total_by_device >= 4 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Too many accounts from this network or device. Contact support for help.'
    );
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- ── RPC: record_signup_metadata ──────────────────────────────────
-- Stamps a profile with signup tracking data.

CREATE OR REPLACE FUNCTION record_signup_metadata(
  p_user_id UUID,
  p_ip TEXT,
  p_device_id TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    signup_ip = p_ip,
    signup_device_id = p_device_id,
    signup_referrer = p_referrer,
    signup_metadata = p_metadata
  WHERE id = p_user_id;
END;
$$;
