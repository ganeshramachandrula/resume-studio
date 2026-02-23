-- Add last_login_at column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Backfill from security_events (most recent login_success per user)
UPDATE profiles p
SET last_login_at = se.latest
FROM (
  SELECT user_id, MAX(created_at) AS latest
  FROM security_events
  WHERE event_type = 'login_success'
  GROUP BY user_id
) se
WHERE p.id = se.user_id;
