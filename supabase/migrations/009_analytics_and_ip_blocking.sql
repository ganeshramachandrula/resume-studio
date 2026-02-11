-- ============================================================
-- Analytics & IP Blocking Migration
-- Adds: blocked_ips table, indexes on security_events for analytics
-- ============================================================

-- ── 1. Blocked IPs table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service role only (no user-facing policies)
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON blocked_ips(ip_address);

-- ── 2. Additional indexes on security_events for analytics ──
CREATE INDEX IF NOT EXISTS idx_security_events_metadata ON security_events USING gin(metadata);

-- ── 3. Function to check if an IP is blocked ───────────────
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM blocked_ips WHERE ip_address = check_ip);
END;
$$;


-- ── 4. Analytics aggregate functions ────────────────────────

-- Country-wise user counts from profiles
CREATE OR REPLACE FUNCTION get_country_user_counts()
RETURNS TABLE(country TEXT, user_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS user_count
  FROM profiles
  GROUP BY COALESCE(country, 'Unknown')
  ORDER BY user_count DESC
  LIMIT 50;
$$;

-- Top IPs by request count in the last N hours
CREATE OR REPLACE FUNCTION get_top_ips(hours_ago INT DEFAULT 24)
RETURNS TABLE(ip_address TEXT, request_count BIGINT, last_seen TIMESTAMPTZ, is_blocked BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    se.ip_address,
    COUNT(*) AS request_count,
    MAX(se.created_at) AS last_seen,
    EXISTS (SELECT 1 FROM blocked_ips bi WHERE bi.ip_address = se.ip_address) AS is_blocked
  FROM security_events se
  WHERE se.created_at > NOW() - (hours_ago || ' hours')::INTERVAL
    AND se.ip_address IS NOT NULL
    AND se.ip_address != 'unknown'
  GROUP BY se.ip_address
  ORDER BY request_count DESC
  LIMIT 50;
$$;

-- Event type breakdown in the last N hours
CREATE OR REPLACE FUNCTION get_event_type_counts(hours_ago INT DEFAULT 24)
RETURNS TABLE(event_type TEXT, event_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT event_type, COUNT(*) AS event_count
  FROM security_events
  WHERE created_at > NOW() - (hours_ago || ' hours')::INTERVAL
  GROUP BY event_type
  ORDER BY event_count DESC;
$$;

-- Geo hits: country-wise request counts from security events (uses IP → country from profiles)
CREATE OR REPLACE FUNCTION get_geo_hits(hours_ago INT DEFAULT 168)
RETURNS TABLE(country TEXT, hit_count BIGINT, unique_users BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(p.country, 'Unknown') AS country,
    COUNT(*) AS hit_count,
    COUNT(DISTINCT se.user_id) AS unique_users
  FROM security_events se
  LEFT JOIN profiles p ON p.id = se.user_id
  WHERE se.created_at > NOW() - (hours_ago || ' hours')::INTERVAL
  GROUP BY COALESCE(p.country, 'Unknown')
  ORDER BY hit_count DESC
  LIMIT 50;
$$;
