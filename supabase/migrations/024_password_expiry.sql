-- Migration 024: Password expiry tracking
-- Adds password_changed_at column to profiles for 90-day forced password change

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing rows: set to created_at so existing users get prompted on next login
UPDATE public.profiles
SET password_changed_at = created_at
WHERE password_changed_at IS NULL OR password_changed_at = now();

-- Add index for efficient expiry checks
CREATE INDEX IF NOT EXISTS idx_profiles_password_changed_at
  ON public.profiles(password_changed_at);
