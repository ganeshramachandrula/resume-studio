-- GhostBoard: company hiring accountability ratings
-- Tables: company_ratings (individual ratings), company_profiles (aggregate cache)

-- ============================================================
-- company_ratings — individual user ratings
-- ============================================================
CREATE TABLE company_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  role TEXT,
  job_application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
  response_time SMALLINT CHECK (response_time BETWEEN 1 AND 5),
  ghosting_rate SMALLINT CHECK (ghosting_rate BETWEEN 1 AND 5),
  interview_quality SMALLINT CHECK (interview_quality BETWEEN 1 AND 5),
  offer_fairness SMALLINT CHECK (offer_fairness BETWEEN 1 AND 5),
  transparency SMALLINT CHECK (transparency BETWEEN 1 AND 5),
  recruiter_professionalism SMALLINT CHECK (recruiter_professionalism BETWEEN 1 AND 5),
  overall_recommendation SMALLINT NOT NULL CHECK (overall_recommendation BETWEEN 1 AND 5),
  review_text TEXT CHECK (char_length(review_text) <= 2000),
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_slug)
);

CREATE INDEX idx_company_ratings_slug ON company_ratings (company_slug);
CREATE INDEX idx_company_ratings_user ON company_ratings (user_id);
CREATE INDEX idx_company_ratings_approved ON company_ratings (is_approved) WHERE is_approved = TRUE;

ALTER TABLE company_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved ratings
CREATE POLICY "company_ratings_select" ON company_ratings
  FOR SELECT USING (is_approved = TRUE);

-- Authenticated users can insert their own
CREATE POLICY "company_ratings_insert" ON company_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "company_ratings_update" ON company_ratings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "company_ratings_delete" ON company_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- company_profiles — materialized aggregate cache
-- ============================================================
CREATE TABLE company_profiles (
  company_slug TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  total_ratings INT NOT NULL DEFAULT 0,
  avg_response_time NUMERIC(3,2),
  avg_ghosting_rate NUMERIC(3,2),
  avg_interview_quality NUMERIC(3,2),
  avg_offer_fairness NUMERIC(3,2),
  avg_transparency NUMERIC(3,2),
  avg_recruiter_professionalism NUMERIC(3,2),
  avg_overall_recommendation NUMERIC(3,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "company_profiles_select" ON company_profiles
  FOR SELECT USING (TRUE);

-- ============================================================
-- Trigger function to refresh company_profiles on rating changes
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_company_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_slug TEXT;
  target_name TEXT;
  rating_count INT;
BEGIN
  -- Determine which company slug to refresh
  IF TG_OP = 'DELETE' THEN
    target_slug := OLD.company_slug;
    target_name := OLD.company_name;
  ELSE
    target_slug := NEW.company_slug;
    target_name := NEW.company_name;
  END IF;

  -- Count approved ratings
  SELECT COUNT(*) INTO rating_count
  FROM company_ratings
  WHERE company_slug = target_slug AND is_approved = TRUE;

  IF rating_count = 0 THEN
    DELETE FROM company_profiles WHERE company_slug = target_slug;
  ELSE
    INSERT INTO company_profiles (
      company_slug, company_name, total_ratings,
      avg_response_time, avg_ghosting_rate, avg_interview_quality,
      avg_offer_fairness, avg_transparency, avg_recruiter_professionalism,
      avg_overall_recommendation, updated_at
    )
    SELECT
      target_slug,
      target_name,
      COUNT(*),
      ROUND(AVG(response_time), 2),
      ROUND(AVG(ghosting_rate), 2),
      ROUND(AVG(interview_quality), 2),
      ROUND(AVG(offer_fairness), 2),
      ROUND(AVG(transparency), 2),
      ROUND(AVG(recruiter_professionalism), 2),
      ROUND(AVG(overall_recommendation), 2),
      now()
    FROM company_ratings
    WHERE company_slug = target_slug AND is_approved = TRUE
    ON CONFLICT (company_slug) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      total_ratings = EXCLUDED.total_ratings,
      avg_response_time = EXCLUDED.avg_response_time,
      avg_ghosting_rate = EXCLUDED.avg_ghosting_rate,
      avg_interview_quality = EXCLUDED.avg_interview_quality,
      avg_offer_fairness = EXCLUDED.avg_offer_fairness,
      avg_transparency = EXCLUDED.avg_transparency,
      avg_recruiter_professionalism = EXCLUDED.avg_recruiter_professionalism,
      avg_overall_recommendation = EXCLUDED.avg_overall_recommendation,
      updated_at = now();
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_refresh_company_profile
  AFTER INSERT OR UPDATE OR DELETE ON company_ratings
  FOR EACH ROW EXECUTE FUNCTION refresh_company_profile();

-- Updated_at trigger for company_ratings
CREATE OR REPLACE FUNCTION update_company_rating_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_company_rating_updated_at
  BEFORE UPDATE ON company_ratings
  FOR EACH ROW EXECUTE FUNCTION update_company_rating_timestamp();
