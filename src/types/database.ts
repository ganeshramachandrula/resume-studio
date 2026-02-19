export type Plan = 'free' | 'pro_monthly' | 'pro_annual' | 'team'

export type DocumentType =
  | 'resume'
  | 'cover_letter'
  | 'linkedin_summary'
  | 'cold_email'
  | 'interview_prep'
  | 'certification_guide'

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
  team_id: string | null
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
