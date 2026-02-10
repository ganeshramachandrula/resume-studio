-- 005_annual_features.sql
-- Career Coach conversations table + document language/template_options columns

-- ── Coach Conversations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  messages JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coach_conversations_user_id ON coach_conversations(user_id);

-- RLS: users manage their own conversations
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON coach_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON coach_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ── Document enhancements ─────────────────────────────────
ALTER TABLE documents ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS template_options JSONB DEFAULT '{}'::jsonb;
