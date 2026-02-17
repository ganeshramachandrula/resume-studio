-- Migration 012: Job Feed + Browser Extension
-- Adds job_preferences, job_feed_cache, extension_submissions tables,
-- job_search daily counter on profiles, and related RPC functions.

-- ── New columns on profiles ──────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS job_search_daily_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS job_search_reset_at TIMESTAMPTZ DEFAULT now();

-- ── Table: job_preferences ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  salary_min INT,
  salary_max INT,
  remote_preference TEXT DEFAULT 'any' CHECK (remote_preference IN ('any', 'remote', 'hybrid', 'onsite')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE job_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON job_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON job_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON job_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Table: job_feed_cache ────────────────────────────────────────
-- Server-side only (service role). No RLS needed.

CREATE TABLE IF NOT EXISTS job_feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  provider TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(query_hash, provider)
);

-- Index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_job_feed_cache_fetched_at ON job_feed_cache (fetched_at);

-- ── Table: extension_submissions ─────────────────────────────────

CREATE TABLE IF NOT EXISTS extension_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT,
  source_site TEXT,
  raw_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'parsed', 'used', 'failed')),
  job_description_id UUID REFERENCES job_descriptions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE extension_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON extension_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON extension_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_extension_submissions_user_id ON extension_submissions (user_id);

-- ── RPC: check_and_increment_job_search ──────────────────────────
-- Atomic daily gate for job searches. Same pattern as parse-jd/ats-score.

CREATE OR REPLACE FUNCTION check_and_increment_job_search(
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

  SELECT job_search_daily_count, job_search_reset_at
  INTO v_count, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_reset_at IS NULL OR now() - v_reset_at > INTERVAL '24 hours' THEN
    UPDATE profiles
    SET job_search_daily_count = 1, job_search_reset_at = now()
    WHERE id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'limit', v_limit);
  END IF;

  IF v_count >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_limit);
  END IF;

  UPDATE profiles
  SET job_search_daily_count = job_search_daily_count + 1
  WHERE id = p_user_id;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - v_count - 1, 'limit', v_limit);
END;
$$;

-- ── RPC: cleanup_job_feed_cache ──────────────────────────────────
-- Deletes cache entries older than 2 hours.

CREATE OR REPLACE FUNCTION cleanup_job_feed_cache()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM job_feed_cache
  WHERE fetched_at < now() - INTERVAL '2 hours';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
