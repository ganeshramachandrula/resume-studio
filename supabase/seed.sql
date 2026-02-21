-- =============================================================================
-- Seed File — LOCAL DEVELOPMENT ONLY
-- =============================================================================
-- This file recreates test users after `supabase db reset`.
-- It is referenced in supabase/config.toml → [db.seed] → sql_paths.
--
-- ⚠️  WARNING: This file is for LOCAL DEVELOPMENT ONLY.
--     It must NEVER be run against a production database.
--     It contains hardcoded passwords and test data.
--
-- All test users use password: TestPassword123
-- =============================================================================

-- ── Helper: stable UUIDs for test users ─────────────────────────────────────
-- Using deterministic UUIDs so we can reference them consistently.
-- Format: 00000000-0000-4000-a000-00000000000N

DO $$
DECLARE
  uid_monthly    UUID := '00000000-0000-4000-a000-000000000001';
  uid_annual     UUID := '00000000-0000-4000-a000-000000000002';
  uid_team       UUID := '00000000-0000-4000-a000-000000000003';
  uid_credits    UUID := '00000000-0000-4000-a000-000000000004';
  uid_e2e        UUID := '00000000-0000-4000-a000-000000000005';
  uid_real       UUID := '00000000-0000-4000-a000-000000000006';
  v_team_id      UUID := '00000000-0000-4000-b000-000000000001';
  pw_hash        TEXT;
BEGIN
  -- Generate bcrypt hash for TestPassword123
  pw_hash := crypt('TestPassword123', gen_salt('bf'));

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1. Create auth users (trigger will auto-create profiles)
  -- ══════════════════════════════════════════════════════════════════════════

  -- Insert all 6 users into auth.users
  -- CRITICAL: GoTrue scans all varchar columns and crashes on NULL.
  -- Every nullable string column MUST be '' (empty string), not NULL.
  -- EXCEPTION: `phone` has a UNIQUE constraint, so it must stay NULL
  -- (multiple empty strings would violate uniqueness).
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current,
    phone_change, phone_change_token,
    reauthentication_token,
    is_sso_user, is_anonymous,
    created_at, updated_at
  ) VALUES
    -- User 1: Pro Monthly
    ('00000000-0000-0000-0000-000000000000', uid_monthly, 'authenticated', 'authenticated',
     'test-monthly@example.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": "Test Monthly User"}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW()),
    -- User 2: Pro Annual
    ('00000000-0000-0000-0000-000000000000', uid_annual, 'authenticated', 'authenticated',
     'test-annual@example.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": "Test Annual User"}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW()),
    -- User 3: Team Plan
    ('00000000-0000-0000-0000-000000000000', uid_team, 'authenticated', 'authenticated',
     'test-team@example.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": "Test Team Admin"}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW()),
    -- User 4: Free with Credits
    ('00000000-0000-0000-0000-000000000000', uid_credits, 'authenticated', 'authenticated',
     'test-credits@example.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": "Test Credits User"}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW()),
    -- User 5: E2E Test (fresh free user)
    ('00000000-0000-0000-0000-000000000000', uid_e2e, 'authenticated', 'authenticated',
     'e2e-test@example.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": "E2E Test User"}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW()),
    -- User 6: Real user account
    ('00000000-0000-0000-0000-000000000000', uid_real, 'authenticated', 'authenticated',
     'prsd_srm@yahoo.com', pw_hash, NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"full_name": ""}',
     '', '', '', '', '', '', '', '', false, false, NOW(), NOW());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2. Create auth identities (required for email/password login)
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES
    (gen_random_uuid(), uid_monthly, jsonb_build_object('sub', uid_monthly::text, 'email', 'test-monthly@example.com'), 'email', uid_monthly::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), uid_annual,  jsonb_build_object('sub', uid_annual::text,  'email', 'test-annual@example.com'),  'email', uid_annual::text,  NOW(), NOW(), NOW()),
    (gen_random_uuid(), uid_team,    jsonb_build_object('sub', uid_team::text,    'email', 'test-team@example.com'),    'email', uid_team::text,    NOW(), NOW(), NOW()),
    (gen_random_uuid(), uid_credits, jsonb_build_object('sub', uid_credits::text, 'email', 'test-credits@example.com'), 'email', uid_credits::text, NOW(), NOW(), NOW()),
    (gen_random_uuid(), uid_e2e,     jsonb_build_object('sub', uid_e2e::text,     'email', 'e2e-test@example.com'),     'email', uid_e2e::text,     NOW(), NOW(), NOW()),
    (gen_random_uuid(), uid_real,    jsonb_build_object('sub', uid_real::text,    'email', 'prsd_srm@yahoo.com'),       'email', uid_real::text,    NOW(), NOW(), NOW());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 3. Create the team (must exist before updating team user's profile)
  -- ══════════════════════════════════════════════════════════════════════════

  INSERT INTO public.teams (id, name, admin_user_id, stripe_customer_id, stripe_subscription_id, seat_count)
  VALUES (v_team_id, 'Test Team', uid_team, 'cus_U0OJImN4APLQaf', NULL, 5);

  -- ══════════════════════════════════════════════════════════════════════════
  -- 4. Update profiles with plans, Stripe IDs, and extras
  --    (profiles were auto-created by the on_auth_user_created trigger)
  -- ══════════════════════════════════════════════════════════════════════════

  -- Basic (was Pro Monthly)
  UPDATE profiles SET
    plan = 'basic',
    stripe_customer_id = 'cus_U0O1XhgGlHSnKP',
    subscription_period_start = NOW(),
    subscription_period_end = NOW() + INTERVAL '1 month'
  WHERE id = uid_monthly;

  -- Pro (was Pro Annual)
  UPDATE profiles SET
    plan = 'pro',
    stripe_customer_id = 'cus_U0OJoX238g1Lt6',
    subscription_period_start = NOW(),
    subscription_period_end = NOW() + INTERVAL '1 month'
  WHERE id = uid_annual;

  -- Pro (was Team)
  UPDATE profiles SET
    plan = 'pro',
    stripe_customer_id = 'cus_U0OJImN4APLQaf',
    subscription_period_start = NOW(),
    subscription_period_end = NOW() + INTERVAL '1 month'
  WHERE id = uid_team;

  -- Credits user
  UPDATE profiles SET
    stripe_customer_id = 'cus_U0OKHzkP7v2rCG',
    credits = 3
  WHERE id = uid_credits;

  -- Admin role for real user
  UPDATE profiles SET
    role = 'admin'
  WHERE id = uid_real;

  RAISE NOTICE '✅ Seed complete: 6 test users created';
END;
$$;
