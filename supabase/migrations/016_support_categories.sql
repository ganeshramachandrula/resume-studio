-- Migration 016: Expand support_messages category options
-- Adds account, technical, and advice categories.

ALTER TABLE public.support_messages
  DROP CONSTRAINT IF EXISTS support_messages_category_check;

ALTER TABLE public.support_messages
  ADD CONSTRAINT support_messages_category_check
  CHECK (category IN ('bug', 'feature', 'billing', 'account', 'technical', 'advice', 'general'));
