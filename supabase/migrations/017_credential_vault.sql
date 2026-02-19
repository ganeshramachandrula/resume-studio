-- Migration 017: Credential Vault
-- 4 tables for storing certificates, skills, work samples, and references.

-- vault_certificates
CREATE TABLE public.vault_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vault_certificates_user ON public.vault_certificates(user_id);
ALTER TABLE public.vault_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_certificates_user_policy ON public.vault_certificates
  FOR ALL USING (auth.uid() = user_id);

-- vault_skills
CREATE TABLE public.vault_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vault_skills_user ON public.vault_skills(user_id);
ALTER TABLE public.vault_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_skills_user_policy ON public.vault_skills
  FOR ALL USING (auth.uid() = user_id);

-- vault_work_samples
CREATE TABLE public.vault_work_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('project', 'portfolio', 'publication', 'presentation', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vault_work_samples_user ON public.vault_work_samples(user_id);
ALTER TABLE public.vault_work_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_work_samples_user_policy ON public.vault_work_samples
  FOR ALL USING (auth.uid() = user_id);

-- vault_references
CREATE TABLE public.vault_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('manager', 'colleague', 'client', 'mentor', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vault_references_user ON public.vault_references(user_id);
ALTER TABLE public.vault_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_references_user_policy ON public.vault_references
  FOR ALL USING (auth.uid() = user_id);
