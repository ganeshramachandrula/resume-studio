-- Migration 013: Referral program + shareable document links

-- Ensure pgcrypto extension is available (needed for digest() in referral code generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Referral codes
CREATE TABLE referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Referral signups
CREATE TABLE referral_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rewarded BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Shared documents
CREATE TABLE shared_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add referral_code column to profiles for tracking who referred whom
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;

-- Referral codes: users can read/create their own
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Referral signups: users can view signups through their codes
CREATE POLICY "Users can view own referral signups"
  ON referral_signups FOR SELECT
  USING (
    referral_code_id IN (SELECT id FROM referral_codes WHERE user_id = auth.uid())
  );

-- Shared documents: users manage their own
CREATE POLICY "Users can view own shares"
  ON shared_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares"
  ON shared_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
  ON shared_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_signups_code ON referral_signups(referral_code_id);
CREATE INDEX idx_referral_signups_user ON referral_signups(referred_user_id);
CREATE INDEX idx_shared_documents_token ON shared_documents(share_token);
CREATE INDEX idx_shared_documents_user ON shared_documents(user_id);

-- Function to generate a unique referral code for a user (idempotent)
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Check existing
  SELECT code INTO v_code FROM referral_codes WHERE user_id = p_user_id LIMIT 1;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;
  -- Generate 8-char code from user_id hash
  v_code := substr(encode(digest(p_user_id::text || extract(epoch from now())::text, 'sha256'), 'hex'), 1, 8);
  INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code)
  ON CONFLICT (code) DO NOTHING;
  -- If collision, try once more with different seed
  IF NOT FOUND THEN
    v_code := substr(encode(digest(p_user_id::text || gen_random_uuid()::text, 'sha256'), 'hex'), 1, 8);
    INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, v_code);
  END IF;
  RETURN v_code;
END;
$$;

-- Function to record a referral signup
CREATE OR REPLACE FUNCTION record_referral_signup(p_referred_user_id UUID, p_referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_id UUID;
  v_referrer_id UUID;
BEGIN
  -- Find the referral code
  SELECT id, user_id INTO v_code_id, v_referrer_id
  FROM referral_codes WHERE code = p_referral_code;
  IF v_code_id IS NULL THEN
    RETURN false;
  END IF;
  -- Don't allow self-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN false;
  END IF;
  -- Don't allow duplicate referrals
  IF EXISTS (SELECT 1 FROM referral_signups WHERE referred_user_id = p_referred_user_id) THEN
    RETURN false;
  END IF;
  -- Record the signup
  INSERT INTO referral_signups (referral_code_id, referred_user_id)
  VALUES (v_code_id, p_referred_user_id);
  -- Mark on profile
  UPDATE profiles SET referred_by = p_referral_code WHERE id = p_referred_user_id;
  RETURN true;
END;
$$;

-- Function to increment share view count (public, no auth needed)
CREATE OR REPLACE FUNCTION increment_share_views(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_documents SET views = views + 1 WHERE share_token = p_token;
END;
$$;
