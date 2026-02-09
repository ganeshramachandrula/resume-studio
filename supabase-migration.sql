-- ResumeAI Studio Database Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro_monthly', 'pro_annual')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Experiences (user work history)
CREATE TABLE public.experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  raw_text TEXT,
  structured_data JSONB NOT NULL DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own experiences" ON public.experiences
  FOR ALL USING (auth.uid() = user_id);

-- Job Descriptions (parsed JDs)
CREATE TABLE public.job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  raw_text TEXT NOT NULL,
  parsed_data JSONB NOT NULL DEFAULT '{}',
  company_name TEXT,
  role_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own JDs" ON public.job_descriptions
  FOR ALL USING (auth.uid() = user_id);

-- Generated Documents
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'cover_letter', 'linkedin_summary', 'cold_email', 'interview_prep')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  template TEXT DEFAULT 'modern',
  ats_score INTEGER,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- Job Applications Tracker
CREATE TABLE public.job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  notes TEXT,
  applied_at TIMESTAMPTZ,
  document_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own applications" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id);

-- Usage tracking function
CREATE OR REPLACE FUNCTION public.increment_usage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  reset_time TIMESTAMPTZ;
BEGIN
  SELECT usage_count, usage_reset_at INTO current_count, reset_time
  FROM public.profiles WHERE id = user_uuid;

  -- Reset monthly counter if needed
  IF reset_time < NOW() - INTERVAL '30 days' THEN
    UPDATE public.profiles
    SET usage_count = 1, usage_reset_at = NOW()
    WHERE id = user_uuid;
    RETURN 1;
  END IF;

  -- Increment
  UPDATE public.profiles
  SET usage_count = usage_count + 1
  WHERE id = user_uuid;

  RETURN current_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_job_apps_user ON public.job_applications(user_id);
CREATE INDEX idx_job_apps_status ON public.job_applications(status);
CREATE INDEX idx_jd_user ON public.job_descriptions(user_id);
