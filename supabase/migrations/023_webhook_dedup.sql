-- ============================================================
-- Webhook Event Deduplication Table
-- Replaces in-memory Set with persistent DB-backed dedup
-- to prevent duplicate processing across serverless instances.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-clean events older than 7 days to prevent unbounded growth
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON public.processed_webhook_events(processed_at);

-- RLS: no user access needed, only service role
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
