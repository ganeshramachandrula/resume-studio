-- Migration 018: Country Resume document type
-- Adds 'country_resume' to the documents type CHECK constraint.

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_type_check
  CHECK (type IN ('resume','cover_letter','linkedin_summary','cold_email','interview_prep','certification_guide','country_resume'));
