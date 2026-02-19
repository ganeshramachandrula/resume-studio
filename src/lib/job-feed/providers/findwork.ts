import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface FindworkResult {
  id?: number
  role?: string
  company_name?: string
  location?: string
  remote?: boolean
  text?: string
  url?: string
  date_posted?: string
  logo?: string
  keywords?: string[]
  employment_type?: string
}

export async function searchFindwork(params: JobSearchParams): Promise<NormalizedJob[]> {
  const apiKey = process.env.FINDWORK_API_KEY
  if (!apiKey) return []

  try {
    const query = encodeURIComponent(params.query)
    const locationParts = [params.location, params.country].filter(Boolean).join(', ')
    const location = locationParts ? `&location=${encodeURIComponent(locationParts)}` : ''
    const remote = params.remote_only ? '&remote=true' : ''

    const res = await fetch(
      `https://findwork.dev/api/jobs/?search=${query}${location}${remote}`,
      {
        headers: { Authorization: `Token ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: FindworkResult[] = json.results || []

    return results.map((job): NormalizedJob => {
      const desc = (job.text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

      return {
        id: `findwork-${job.id || Math.random().toString(36).slice(2)}`,
        provider: 'findwork',
        title: job.role || 'Untitled',
        company: job.company_name || 'Unknown',
        location: job.location || 'Not specified',
        remote: job.remote || false,
        salary: null,
        description: desc.slice(0, 500),
        full_description: desc,
        url: job.url || '',
        posted_at: job.date_posted || null,
        logo_url: job.logo || null,
        tags: [
          ...(job.keywords || []),
          ...(job.employment_type ? [job.employment_type] : []),
        ],
      }
    })
  } catch {
    return []
  }
}
