-- Migration 019: Production Hardening
-- Adds distributed rate limiting table + RPC, and account lockout columns on profiles.

-- ── Rate Limits Table ──────────────────────────────────────
-- Replaces in-memory rate limiting for serverless deployments.
-- Each row represents a count of requests for a key within a time window.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- Index for fast lookups + cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window
  ON public.rate_limits (key, window_start DESC);

-- RLS: No public access — only service_role can read/write (rate limiting is server-side)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No RLS policies = no access via anon/authenticated roles (service_role bypasses RLS)

-- ── Atomic check-and-increment RPC ─────────────────────────
-- Returns { allowed: bool, count: int, retry_after?: int }

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
) RETURNS JSONB AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Clean old entries for this key
  DELETE FROM public.rate_limits
  WHERE key = p_key AND window_start < v_window_start;

  -- Count recent requests
  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM public.rate_limits
  WHERE key = p_key AND window_start >= v_window_start;

  IF v_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'count', v_count,
      'retry_after', p_window_seconds
    );
  END IF;

  -- Insert new entry (bucket by second)
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, date_trunc('second', now()), 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1;

  RETURN jsonb_build_object('allowed', true, 'count', v_count + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Account Lockout Columns ────────────────────────────────
-- Tracks failed login attempts and temporary lockouts.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
