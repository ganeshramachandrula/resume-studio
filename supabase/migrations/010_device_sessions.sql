-- Migration 010: Device Sessions for concurrent device limiting
-- Tracks active device sessions per user with automatic stale cleanup

-- ── Table ─────────────────────────────────────────────────
CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_label TEXT DEFAULT 'Unknown Device',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON device_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (via RPC)
CREATE POLICY "Service role manages sessions" ON device_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for efficient queries
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_device_sessions_last_active ON device_sessions(last_active_at);
CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);

-- ── Register Device Session (Atomic) ──────────────────────
-- Cleanup stale → check existing → count active → kick oldest if over limit → upsert
CREATE OR REPLACE FUNCTION register_device_session(
  p_user_id UUID,
  p_device_id TEXT,
  p_device_label TEXT DEFAULT 'Unknown Device',
  p_max_devices INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_count INT;
  v_kicked_device_id TEXT;
  v_kicked_session_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Cleanup stale sessions (inactive > 30 min)
  DELETE FROM device_sessions
  WHERE user_id = p_user_id
    AND last_active_at < NOW() - INTERVAL '30 minutes';

  -- 2. Upsert current device (updates last_active_at if exists)
  INSERT INTO device_sessions (user_id, device_id, device_label, last_active_at)
  VALUES (p_user_id, p_device_id, p_device_label, NOW())
  ON CONFLICT (user_id, device_id)
  DO UPDATE SET
    device_label = EXCLUDED.device_label,
    last_active_at = NOW();

  -- 3. Count active sessions for this user
  SELECT COUNT(*) INTO v_active_count
  FROM device_sessions
  WHERE user_id = p_user_id;

  -- 4. If over limit, kick the oldest session (excluding current device)
  IF v_active_count > p_max_devices THEN
    SELECT id, device_id INTO v_kicked_session_id, v_kicked_device_id
    FROM device_sessions
    WHERE user_id = p_user_id
      AND device_id != p_device_id
    ORDER BY last_active_at ASC
    LIMIT 1;

    IF v_kicked_session_id IS NOT NULL THEN
      DELETE FROM device_sessions WHERE id = v_kicked_session_id;

      v_result := jsonb_build_object(
        'success', true,
        'kicked', true,
        'kicked_device_id', v_kicked_device_id
      );

      -- Log security event for kicked session
      INSERT INTO security_events (event_type, user_id, metadata)
      VALUES (
        'device_session_kicked',
        p_user_id,
        jsonb_build_object(
          'kicked_device_id', v_kicked_device_id,
          'new_device_id', p_device_id,
          'max_devices', p_max_devices
        )
      );

      RETURN v_result;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'kicked', false);
END;
$$;

-- ── Cleanup Stale Sessions ────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_stale_device_sessions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM device_sessions
  WHERE last_active_at < NOW() - INTERVAL '30 minutes';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ── Admin: Get User Active Sessions ───────────────────────
CREATE OR REPLACE FUNCTION get_user_active_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  device_id TEXT,
  device_label TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ds.id, ds.device_id, ds.device_label, ds.last_active_at, ds.created_at
  FROM device_sessions ds
  WHERE ds.user_id = p_user_id
    AND ds.last_active_at >= NOW() - INTERVAL '30 minutes'
  ORDER BY ds.last_active_at DESC;
END;
$$;
