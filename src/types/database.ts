export type Plan = 'free' | 'basic' | 'pro'

export type DocumentType =
  | 'resume'
  | 'cover_letter'
  | 'linkedin_summary'
  | 'cold_email'
  | 'interview_prep'
  | 'certification_guide'
  | 'country_resume'
  | 'follow_up_email'

export type JobStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type UserRole = 'user' | 'admin'

export type SupportCategory = 'bug' | 'feature' | 'billing' | 'account' | 'technical' | 'advice' | 'general'
export type SupportStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_period_start: string | null
  subscription_period_end: string | null
  usage_count: number
  saved_applications_count: number
  coach_messages_count: number
  country: string | null
  credits: number
  usage_reset_at: string
  role: UserRole
  is_disabled: boolean
  signup_ip: string | null
  signup_device_id: string | null
  signup_referrer: string | null
  signup_metadata: Record<string, unknown> | null
  parse_jd_daily_count: number
  parse_jd_reset_at: string
  ats_score_daily_count: number
  ats_score_reset_at: string
  job_search_daily_count: number
  job_search_reset_at: string
  password_changed_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  name: string | null
  email: string
  subject: string
  message: string
  category: SupportCategory
  status: SupportStatus
  user_id: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  user_id: string
  raw_text: string | null
  structured_data: Record<string, unknown>
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface JobDescription {
  id: string
  user_id: string
  raw_text: string
  parsed_data: Record<string, unknown>
  company_name: string | null
  role_title: string | null
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  job_description_id: string | null
  type: DocumentType
  title: string
  content: Record<string, unknown>
  template: string
  ats_score: number | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  company: string
  role: string
  url: string | null
  status: JobStatus
  notes: string | null
  applied_at: string | null
  document_ids: string[]
  created_at: string
  updated_at: string
}

// Credential Vault types
export type VaultProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type WorkSampleType = 'project' | 'portfolio' | 'publication' | 'presentation' | 'other'
export type ReferenceRelationship = 'manager' | 'colleague' | 'client' | 'mentor' | 'other'

export interface VaultCertificate {
  id: string
  user_id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface VaultSkill {
  id: string
  user_id: string
  name: string
  category: string | null
  proficiency: VaultProficiency
  created_at: string
  updated_at: string
}

export interface VaultWorkSample {
  id: string
  user_id: string
  title: string
  description: string | null
  url: string
  type: WorkSampleType
  created_at: string
  updated_at: string
}

// GhostBoard types
export interface CompanyRating {
  id: string
  user_id: string
  company_name: string
  company_slug: string
  role: string | null
  job_application_id: string | null
  response_time: number | null
  ghosting_rate: number | null
  interview_quality: number | null
  offer_fairness: number | null
  transparency: number | null
  recruiter_professionalism: number | null
  overall_recommendation: number
  review_text: string | null
  is_flagged: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  company_slug: string
  company_name: string
  total_ratings: number
  avg_response_time: number | null
  avg_ghosting_rate: number | null
  avg_interview_quality: number | null
  avg_offer_fairness: number | null
  avg_transparency: number | null
  avg_recruiter_professionalism: number | null
  avg_overall_recommendation: number | null
  updated_at: string
}

export interface VaultReference {
  id: string
  user_id: string
  name: string
  title: string
  company: string
  email: string | null
  phone: string | null
  relationship: ReferenceRelationship
  created_at: string
  updated_at: string
}
