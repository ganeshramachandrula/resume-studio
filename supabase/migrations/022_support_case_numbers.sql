-- ============================================================
-- Support Case Numbers + User Case History
-- Adds auto-incrementing case numbers (RS-0001) to support_messages
-- and RLS policy so users can read their own cases.
-- ============================================================

-- ── 1. Create sequence for case numbers ────────────────────
CREATE SEQUENCE IF NOT EXISTS support_case_number_seq START WITH 1 INCREMENT BY 1;

-- ── 2. Add case_number column ──────────────────────────────
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS case_number TEXT;

-- ── 3. Backfill existing rows (ordered by creation) ────────
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.support_messages
  WHERE case_number IS NULL
)
UPDATE public.support_messages sm
SET case_number = 'RS-' || LPAD(n.rn::TEXT, 4, '0')
FROM numbered n
WHERE sm.id = n.id;

-- Advance sequence past existing rows
SELECT setval('support_case_number_seq',
  COALESCE((SELECT COUNT(*) FROM public.support_messages), 0) + 1,
  false
);

-- ── 4. Set default for new rows ────────────────────────────
ALTER TABLE public.support_messages
  ALTER COLUMN case_number SET DEFAULT 'RS-' || LPAD(nextval('support_case_number_seq')::TEXT, 4, '0');

-- ── 5. Index on case_number for lookups ────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_messages_case_number
  ON public.support_messages(case_number);

-- ── 6. RLS policy: users can read their own support cases ──
CREATE POLICY "Users can read own support cases"
  ON public.support_messages
  FOR SELECT
  USING (auth.uid() = user_id);
