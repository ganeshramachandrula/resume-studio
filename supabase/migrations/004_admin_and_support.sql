-- Migration 004: Admin role + support messages
-- Adds admin capabilities and support contact form storage

-- ── 1. Add role and is_disabled to profiles ─────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- ── 2. Create support_messages table ────────────────────────

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT CHECK (category IN ('bug', 'feature', 'billing', 'general')) DEFAULT 'general',
  status TEXT CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')) DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON public.support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_user ON public.support_messages(user_id);

-- ── 3. RLS for support_messages ─────────────────────────────
-- Only accessible via service role (admin API routes)

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — all access goes through service role in API routes

-- ── 4. Updated_at trigger for support_messages ──────────────

CREATE OR REPLACE FUNCTION public.update_support_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_message_updated_at();
