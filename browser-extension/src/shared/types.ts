/** Job board site identifiers */
export type SiteName =
  | 'indeed'
  | 'linkedin'
  | 'monster'
  | 'glassdoor'
  | 'dice'
  | 'ziprecruiter'
  | 'generic'

/** Metadata extracted from a job listing page */
export interface JobMeta {
  company: string | null
  role: string | null
}

/** Full extraction result from a job page */
export interface JobExtraction {
  jd: string | null
  meta: JobMeta
  site: SiteName
}

/** Auth credentials stored in browser.storage.local */
export interface StoredAuth {
  access_token: string
  refresh_token: string
  user_email: string
  user_id: string
}

/** Login API response */
export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: { email: string; id: string }
}

/** Submit JD API response */
export interface SubmitJDResponse {
  submission_id: string
  job_description_id: string
  redirect_url: string
  full_url: string
}

/** Save job API response */
export interface SaveJobResponse {
  success: boolean
  id: string
}

/** Company rating summary from GhostBoard */
export interface CompanyRating {
  company_name: string
  company_slug: string
  total_ratings: number
  avg_overall: number
  avg_response_time: number | null
  avg_ghosting_rate: number | null
  avg_interview_quality: number | null
}

/** Rating submission payload */
export interface RatingSubmission {
  company_name: string
  role?: string
  response_time?: number
  ghosting_rate?: number
  interview_quality?: number
  offer_fairness?: number
  transparency?: number
  recruiter_professionalism?: number
  overall_recommendation: number
  review_text?: string
}

/** Message types for background ↔ content/popup communication */
export type MessageType =
  | { type: 'CHECK_AUTH' }
  | { type: 'LOGOUT' }
  | { type: 'OPEN_TAB'; url: string }
  | { type: 'GET_JOB_DATA' }

export type MessageResponse =
  | { loggedIn: boolean; email: string | null }
  | { success: boolean }
  | { job: JobExtraction | null }
