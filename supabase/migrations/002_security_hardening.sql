-- ============================================================
-- Security Hardening Migration
-- Adds: atomic usage counter, security events table, updated signup trigger
-- ============================================================

-- ── 1. Atomic Usage Counter Function ─────────────────────────
-- Replaces the two-step check-then-increment pattern with a single
-- atomic operation using SELECT ... FOR UPDATE row locking.

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
  v_reset_date TIMESTAMPTZ;
BEGIN
  -- Lock the row to prevent concurrent requests from racing
  SELECT plan, usage_count, usage_reset_date
  INTO v_plan, v_usage, v_reset_date
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
        usage_reset_date = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE id = user_uuid;
  END IF;

  -- Pro users: always allowed, still increment for analytics
  IF v_plan IN ('pro_monthly', 'pro_annual') THEN
    UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
    RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'pro_plan');
  END IF;

  -- Free users: check limit
  IF v_usage >= max_free_usage THEN
    RETURN jsonb_build_object('allowed', false, 'usage_count', v_usage, 'reason', 'limit_reached');
  END IF;

  -- Increment and allow
  UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
  RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'allowed');
END;
$$;


-- ── 2. Security Events Table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS enabled with NO user-facing policies (service role only)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Auto-cleanup: delete events older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;


-- ── 3. Update Handle New User Trigger ────────────────────────
-- Block disposable emails at the DB level (defense in depth)

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_domain TEXT;
  v_disposable_domains TEXT[] := ARRAY[
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org',
    'throwaway.email', 'yopmail.com', 'yopmail.fr', 'maildrop.cc',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com',
    'trashmail.com', 'trashmail.me', 'getnada.com', 'getairmail.com',
    '10minutemail.com', '10minute.email', 'fakeinbox.com', 'fakemail.net',
    'mailnesia.com', 'emailondeck.com', 'mohmal.com', 'spambox.us',
    'nospam4.us', 'meltmail.com', 'mintemail.com'
  ];
BEGIN
  -- Extract domain from email
  v_domain := split_part(NEW.email, '@', 2);

  -- Check if the domain is disposable
  IF v_domain = ANY(v_disposable_domains) THEN
    RAISE EXCEPTION 'Registration with disposable email addresses is not allowed';
  END IF;

  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
