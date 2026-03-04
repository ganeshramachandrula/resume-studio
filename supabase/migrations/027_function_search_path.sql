-- Fix: Set search_path on all SECURITY DEFINER functions to prevent
-- search_path manipulation attacks (Supabase lint: function_search_path_mutable)

-- 1. check_and_increment_usage
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  user_uuid UUID,
  max_free_usage INT DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_usage INT;
  v_reset_date TIMESTAMPTZ;
BEGIN
  SELECT plan, usage_count, usage_reset_at
  INTO v_plan, v_usage, v_reset_date
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'usage_count', 0, 'reason', 'profile_not_found');
  END IF;

  IF v_reset_date IS NOT NULL AND NOW() > v_reset_date THEN
    v_usage := 0;
    UPDATE profiles
    SET usage_count = 0,
        usage_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE id = user_uuid;
  END IF;

  IF v_plan IN ('pro_monthly', 'pro_annual') THEN
    UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
    RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'pro_plan');
  END IF;

  IF v_usage >= max_free_usage THEN
    RETURN jsonb_build_object('allowed', false, 'usage_count', v_usage, 'reason', 'limit_reached');
  END IF;

  UPDATE profiles SET usage_count = v_usage + 1 WHERE id = user_uuid;
  RETURN jsonb_build_object('allowed', true, 'usage_count', v_usage + 1, 'reason', 'allowed');
END;
$$;

-- 2. check_application_limit
CREATE OR REPLACE FUNCTION check_application_limit(
  user_uuid UUID,
  job_description_uuid UUID,
  max_applications INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_saved_count INT;
  v_existing_docs INT;
BEGIN
  SELECT plan, saved_applications_count
  INTO v_plan, v_saved_count
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'profile_not_found');
  END IF;

  IF v_plan NOT IN ('pro_monthly', 'pro_annual') THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'free_preview');
  END IF;

  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = user_uuid AND job_description_id = job_description_uuid;

  IF v_existing_docs > 0 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'existing_application');
  END IF;

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

-- 3. get_top_ips
CREATE OR REPLACE FUNCTION get_top_ips(hours_ago INT DEFAULT 24)
RETURNS TABLE(ip_address TEXT, request_count BIGINT, last_seen TIMESTAMPTZ, is_blocked BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- 4. get_event_type_counts
CREATE OR REPLACE FUNCTION get_event_type_counts(hours_ago INT DEFAULT 24)
RETURNS TABLE(event_type TEXT, event_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT event_type, COUNT(*) AS event_count
  FROM security_events
  WHERE created_at > NOW() - (hours_ago || ' hours')::INTERVAL
  GROUP BY event_type
  ORDER BY event_count DESC;
$$;

-- 5. cleanup_stale_device_sessions
CREATE OR REPLACE FUNCTION cleanup_stale_device_sessions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 6. get_geo_hits
CREATE OR REPLACE FUNCTION get_geo_hits(hours_ago INT DEFAULT 168)
RETURNS TABLE(country TEXT, hit_count BIGINT, unique_users BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- 7. register_device_session
CREATE OR REPLACE FUNCTION register_device_session(
  p_user_id UUID,
  p_device_id TEXT,
  p_device_label TEXT DEFAULT 'Unknown Device',
  p_max_devices INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_count INT;
  v_kicked_device_id TEXT;
  v_kicked_session_id UUID;
  v_result JSONB;
BEGIN
  DELETE FROM device_sessions
  WHERE user_id = p_user_id
    AND last_active_at < NOW() - INTERVAL '30 minutes';

  INSERT INTO device_sessions (user_id, device_id, device_label, last_active_at)
  VALUES (p_user_id, p_device_id, p_device_label, NOW())
  ON CONFLICT (user_id, device_id)
  DO UPDATE SET
    device_label = EXCLUDED.device_label,
    last_active_at = NOW();

  SELECT COUNT(*) INTO v_active_count
  FROM device_sessions
  WHERE user_id = p_user_id;

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

-- 8. get_user_active_sessions
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
SET search_path = public
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

-- 9. check_and_increment_parse_jd
CREATE OR REPLACE FUNCTION check_and_increment_parse_jd(
  p_user_id UUID,
  p_max_daily INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_reset_at TIMESTAMPTZ;
  v_limit INT;
BEGIN
  v_limit := p_max_daily;

  SELECT parse_jd_daily_count, parse_jd_reset_at
  INTO v_count, v_reset_at
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_reset_at IS NULL OR now() - v_reset_at > INTERVAL '24 hours' THEN
    UPDATE profiles
    SET parse_jd_daily_count = 1, parse_jd_reset_at = now()
    WHERE id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'limit', v_limit);
  END IF;

  IF v_count >= v_limit THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_limit);
  END IF;

  UPDATE profiles
  SET parse_jd_daily_count = parse_jd_daily_count + 1
  WHERE id = p_user_id;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_limit - v_count - 1, 'limit', v_limit);
END;
$$;

-- 10. check_and_increment_ats_score
CREATE OR REPLACE FUNCTION check_and_increment_ats_score(
  p_user_id UUID,
  p_max_daily INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 11. cleanup_old_security_events
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- 12. get_country_user_counts
CREATE OR REPLACE FUNCTION get_country_user_counts()
RETURNS TABLE(country TEXT, user_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS user_count
  FROM profiles
  GROUP BY COALESCE(country, 'Unknown')
  ORDER BY user_count DESC
  LIMIT 50;
$$;

-- 13. save_document_with_bundle_tracking
CREATE OR REPLACE FUNCTION save_document_with_bundle_tracking(
  p_user_id UUID,
  p_job_description_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content JSONB,
  p_template TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_docs INT;
  v_doc_row documents%ROWTYPE;
BEGIN
  SELECT COUNT(*) INTO v_existing_docs
  FROM documents
  WHERE user_id = p_user_id AND job_description_id = p_job_description_id;

  INSERT INTO documents (user_id, job_description_id, type, title, content, template)
  VALUES (p_user_id, p_job_description_id, p_type, p_title, p_content, COALESCE(p_template, 'modern'))
  RETURNING * INTO v_doc_row;

  IF v_existing_docs = 0 THEN
    UPDATE profiles
    SET saved_applications_count = saved_applications_count + 1
    WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_doc_row.id,
    'user_id', v_doc_row.user_id,
    'job_description_id', v_doc_row.job_description_id,
    'type', v_doc_row.type,
    'title', v_doc_row.title,
    'content', v_doc_row.content,
    'template', v_doc_row.template,
    'created_at', v_doc_row.created_at
  );
END;
$$;

-- 14. delete_application
CREATE OR REPLACE FUNCTION delete_application(
  user_uuid UUID,
  jd_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM documents
  WHERE user_id = user_uuid AND job_description_id = jd_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count > 0 THEN
    UPDATE profiles
    SET saved_applications_count = GREATEST(saved_applications_count - 1, 0)
    WHERE id = user_uuid;
  END IF;

  DELETE FROM job_descriptions
  WHERE id = jd_id AND user_id = user_uuid;

  RETURN jsonb_build_object('deleted_count', v_deleted_count);
END;
$$;

-- 15. update_support_message_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_support_message_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 16. increment_coach_count
CREATE OR REPLACE FUNCTION increment_coach_count(user_row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET coach_messages_count = coach_messages_count + 1,
      updated_at = now()
  WHERE id = user_row_id;
END;
$$;

-- 17. add_credits
CREATE OR REPLACE FUNCTION add_credits(
  user_uuid UUID,
  credit_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 18. is_ip_blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM blocked_ips WHERE ip_address = check_ip);
END;
$$;

-- 19. check_signup_allowed
CREATE OR REPLACE FUNCTION check_signup_allowed(
  p_ip TEXT,
  p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_by_ip INT;
  v_free_by_device INT;
  v_total_by_ip INT;
  v_total_by_device INT;
BEGIN
  SELECT COUNT(*) INTO v_free_by_ip
  FROM profiles
  WHERE signup_ip = p_ip AND plan = 'free';

  IF p_device_id IS NOT NULL AND p_device_id != '' THEN
    SELECT COUNT(*) INTO v_free_by_device
    FROM profiles
    WHERE signup_device_id = p_device_id AND plan = 'free';
  ELSE
    v_free_by_device := 0;
  END IF;

  IF v_free_by_ip >= 1 OR v_free_by_device >= 1 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'A free account already exists from this network or device.'
    );
  END IF;

  SELECT COUNT(*) INTO v_total_by_ip
  FROM profiles
  WHERE signup_ip = p_ip;

  IF p_device_id IS NOT NULL AND p_device_id != '' THEN
    SELECT COUNT(*) INTO v_total_by_device
    FROM profiles
    WHERE signup_device_id = p_device_id;
  ELSE
    v_total_by_device := 0;
  END IF;

  IF v_total_by_ip >= 4 OR v_total_by_device >= 4 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Too many accounts from this network or device. Contact support for help.'
    );
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- 20. record_signup_metadata
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
SET search_path = public
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

-- 21. check_and_increment_job_search
CREATE OR REPLACE FUNCTION check_and_increment_job_search(
  p_user_id UUID,
  p_max_daily INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 22. cleanup_job_feed_cache
CREATE OR REPLACE FUNCTION cleanup_job_feed_cache()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 23. get_or_create_referral_code
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  SELECT code INTO v_code FROM referral_codes WHERE user_id = p_user_id LIMIT 1;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;
  v_code := substr(encode(digest(p_user_id::text || extract(epoch from now())::text, 'sha256'), 'hex'), 1, 8);
  INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code)
  ON CONFLICT (code) DO NOTHING;
  IF NOT FOUND THEN
    v_code := substr(encode(digest(p_user_id::text || gen_random_uuid()::text, 'sha256'), 'hex'), 1, 8);
    INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code);
  END IF;
  RETURN v_code;
END;
$$;

-- 24. record_referral_signup
CREATE OR REPLACE FUNCTION record_referral_signup(p_referred_user_id UUID, p_referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id UUID;
  v_referrer_id UUID;
BEGIN
  SELECT id, user_id INTO v_code_id, v_referrer_id
  FROM referral_codes WHERE code = p_referral_code;
  IF v_code_id IS NULL THEN
    RETURN false;
  END IF;
  IF v_referrer_id = p_referred_user_id THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM referral_signups WHERE referred_user_id = p_referred_user_id) THEN
    RETURN false;
  END IF;
  INSERT INTO referral_signups (referral_code_id, referred_user_id)
  VALUES (v_code_id, p_referred_user_id);
  UPDATE profiles SET referred_by = p_referral_code WHERE id = p_referred_user_id;
  RETURN true;
END;
$$;

-- 25. increment_share_views
CREATE OR REPLACE FUNCTION increment_share_views(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE shared_documents SET views = views + 1 WHERE share_token = p_token;
END;
$$;

-- 26. check_rate_limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  DELETE FROM public.rate_limits
  WHERE key = p_key AND window_start < v_window_start;

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

  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, date_trunc('second', now()), 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1;

  RETURN jsonb_build_object('allowed', true, 'count', v_count + 1);
END;
$$;
