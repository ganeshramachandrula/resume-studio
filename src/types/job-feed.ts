export type JobProvider =
  | 'jsearch'
  | 'adzuna'
  | 'themuse'
  | 'remotive'
  | 'remoteok'
  | 'arbeitnow'
  | 'findwork'

export interface NormalizedJob {
  id: string
  provider: JobProvider
  title: string
  company: string
  location: string
  remote: boolean
  salary: string | null
  description: string // preview, max 500 chars
  full_description: string
  url: string
  posted_at: string | null
  logo_url: string | null
  tags: string[]
}

export interface JobSearchParams {
  query: string
  location?: string
  country?: string
  remote_only?: boolean
  page?: number
}

export interface JobSearchResponse {
  jobs: NormalizedJob[]
  total: number
  page: number
  providers_queried: string[]
  cached: boolean
}

export type DateRange = '7d' | '14d' | '30d'

export interface JobFeedFilters {
  providers: JobProvider[]
  remote_only: boolean
  location: string
  sort_by: 'date' | 'relevance'
  search_query: string
  date_range: DateRange
}

export type RemotePreference = 'any' | 'remote' | 'hybrid' | 'onsite'

export interface JobPreferences {
  id: string
  user_id: string
  skills: string[]
  roles: string[]
  locations: string[]
  country?: string
  salary_min: number | null
  salary_max: number | null
  remote_preference: RemotePreference
  created_at: string
  updated_at: string
}

export interface ExtensionSubmission {
  id: string
  user_id: string
  source_url: string | null
  source_site: string | null
  raw_text: string
  status: 'pending' | 'parsed' | 'used' | 'failed'
  job_description_id: string | null
  created_at: string
}
