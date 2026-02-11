export interface AffiliatePartner {
  id: string
  name: string
  description: string
  url: string
  category: 'job_board' | 'networking' | 'learning' | 'tools'
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn Premium',
    description: 'Boost your job search with InMail & insights',
    url: 'https://www.linkedin.com/premium',
    category: 'networking',
  },
  {
    id: 'indeed',
    name: 'Indeed',
    description: 'Search millions of jobs worldwide',
    url: 'https://www.indeed.com',
    category: 'job_board',
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    description: 'Company reviews & salary data',
    url: 'https://www.glassdoor.com',
    category: 'job_board',
  },
  {
    id: 'coursera',
    name: 'Coursera',
    description: 'Online courses from top universities',
    url: 'https://www.coursera.org',
    category: 'learning',
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    description: 'Polish your writing for applications',
    url: 'https://www.grammarly.com',
    category: 'tools',
  },
]

export function buildAffiliateUrl(partner: AffiliatePartner): string {
  const url = new URL(partner.url)
  url.searchParams.set('utm_source', 'resumestudio')
  url.searchParams.set('utm_medium', 'referral')
  url.searchParams.set('utm_campaign', 'partner_resources')
  url.searchParams.set('utm_content', partner.id)
  return url.toString()
}
