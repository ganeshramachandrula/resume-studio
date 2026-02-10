export const APP_NAME = 'Resume Studio'
export const APP_DESCRIPTION = 'Smart career document generation platform'

export const FREE_DOCS_PER_MONTH = 2
export const MAX_APPLICATIONS_PRO = 10
export const MAX_DOCS_PER_APPLICATION = 5

export const DOCUMENT_TYPES = [
  'resume',
  'cover_letter',
  'linkedin_summary',
  'cold_email',
  'interview_prep',
] as const

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  linkedin_summary: 'LinkedIn Summary',
  cold_email: 'Cold Email',
  interview_prep: 'Interview Prep',
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
export const SUPPORT_CATEGORIES = ['bug', 'feature', 'billing', 'general'] as const
export const SUPPORT_STATUSES = ['new', 'in_progress', 'resolved', 'closed'] as const
export const MAX_SUPPORT_MESSAGE_LENGTH = 5000

export const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  billing: 'Billing',
  general: 'General',
}

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const COLORS = {
  brand: '#1A56DB',
  brandLight: '#3B82F6',
  brandDark: '#1E40AF',
  accent: '#10B981',
  accentLight: '#34D399',
  dark: '#0A0F1C',
} as const
