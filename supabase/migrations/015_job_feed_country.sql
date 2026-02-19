-- Migration 015: Add country column to job_preferences
-- Allows users to save their preferred country for job searches.

ALTER TABLE job_preferences
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
