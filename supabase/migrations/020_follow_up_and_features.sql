-- Migration 020: Add 'follow_up_email' to documents type CHECK constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_type_check
  CHECK (type IN ('resume','cover_letter','linkedin_summary','cold_email',
    'interview_prep','certification_guide','country_resume','follow_up_email'));
