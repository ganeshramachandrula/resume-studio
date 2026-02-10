-- Add 'certification_guide' to documents type check constraint
ALTER TABLE documents DROP CONSTRAINT documents_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_type_check
  CHECK (type IN ('resume', 'cover_letter', 'linkedin_summary', 'cold_email', 'interview_prep', 'certification_guide'));
