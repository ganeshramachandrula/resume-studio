export type Plan = 'free' | 'pro_monthly' | 'pro_annual'

export type DocumentType =
  | 'resume'
  | 'cover_letter'
  | 'linkedin_summary'
  | 'cold_email'
  | 'interview_prep'

export type JobStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  usage_count: number
  saved_applications_count: number
  usage_reset_at: string
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
