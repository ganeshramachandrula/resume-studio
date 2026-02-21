export const APP_NAME = 'Resume Studio'
export const APP_DESCRIPTION = 'Smart career document generation platform'

export const FREE_DOCS_PER_MONTH = 2
export const MAX_APPLICATIONS_PRO = 10
export const MAX_DOCS_PER_APPLICATION = 6

export const DOCUMENT_TYPES = [
  'resume',
  'cover_letter',
  'linkedin_summary',
  'cold_email',
  'interview_prep',
  'certification_guide',
  'country_resume',
  'follow_up_email',
] as const

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  linkedin_summary: 'LinkedIn Summary',
  cold_email: 'Cold Email',
  interview_prep: 'Interview Prep',
  certification_guide: 'Certification Guide',
  country_resume: 'Country Resume',
  follow_up_email: 'Follow-Up Email',
}

export const JOB_STATUSES = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const

export const JOB_STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

// Support
export const SUPPORT_CATEGORIES = ['bug', 'feature', 'billing', 'account', 'technical', 'advice', 'general'] as const
export const SUPPORT_STATUSES = ['new', 'in_progress', 'resolved', 'closed'] as const
export const MAX_SUPPORT_MESSAGE_LENGTH = 5000

export const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  billing: 'Billing & Subscription',
  account: 'Account Access',
  technical: 'Technical Issue',
  advice: 'Career Advice',
  general: 'General Inquiry',
}

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

// Daily usage limits per plan (parse-jd)
export const PARSE_JD_DAILY_FREE = 2
export const PARSE_JD_DAILY_PRO = 10
export const PARSE_JD_DAILY_MAX = 20

// Daily usage limits per plan (ats-score)
export const ATS_SCORE_DAILY_FREE = 1
export const ATS_SCORE_DAILY_PRO = 10
export const ATS_SCORE_DAILY_MAX = 20

// Credit Pack
export const CREDIT_PACK_SIZE = 3
export const CREDIT_PACK_PRICE = 2.99

// Team Plan
export const TEAM_MIN_SEATS = 5
export const TEAM_PRICE_PER_SEAT = 59

// Daily usage limits per plan (job-search)
export const JOB_SEARCH_DAILY_FREE = 5
export const JOB_SEARCH_DAILY_PRO = 20
export const JOB_SEARCH_DAILY_MAX = 999

// Job Feed result limits per plan
export const JOB_FEED_RESULTS_FREE = 10
export const JOB_FEED_RESULTS_PRO = 50

// Job providers
export const JOB_PROVIDERS = [
  'jsearch',
  'adzuna',
  'themuse',
  'remotive',
  'remoteok',
  'arbeitnow',
  'findwork',
] as const

export const JOB_PROVIDER_LABELS: Record<string, string> = {
  jsearch: 'JSearch',
  adzuna: 'Adzuna',
  themuse: 'The Muse',
  remotive: 'Remotive',
  remoteok: 'RemoteOK',
  arbeitnow: 'Arbeitnow',
  findwork: 'Findwork',
}

// Credential Vault
export const VAULT_PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
export const VAULT_PROFICIENCY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export const VAULT_WORK_SAMPLE_TYPES = ['project', 'portfolio', 'publication', 'presentation', 'other'] as const
export const VAULT_WORK_SAMPLE_TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  portfolio: 'Portfolio',
  publication: 'Publication',
  presentation: 'Presentation',
  other: 'Other',
}

export const VAULT_RELATIONSHIPS = ['manager', 'colleague', 'client', 'mentor', 'other'] as const
export const VAULT_RELATIONSHIP_LABELS: Record<string, string> = {
  manager: 'Manager',
  colleague: 'Colleague',
  client: 'Client',
  mentor: 'Mentor',
  other: 'Other',
}

export const VAULT_SKILL_CATEGORIES = [
  'Programming',
  'Design',
  'Marketing',
  'Management',
  'Data & Analytics',
  'Cloud & DevOps',
  'Communication',
  'Finance',
  'Sales',
  'Other',
] as const

export const COLORS = {
  brand: '#1A56DB',
  brandLight: '#3B82F6',
  brandDark: '#1E40AF',
  accent: '#10B981',
  accentLight: '#34D399',
  dark: '#0A0F1C',
} as const
