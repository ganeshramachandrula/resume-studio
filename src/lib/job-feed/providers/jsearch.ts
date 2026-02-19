import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'

interface JSearchResult {
  job_id?: string
  job_title?: string
  employer_name?: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_is_remote?: boolean
  job_min_salary?: number
  job_max_salary?: number
  job_salary_currency?: string
  job_description?: string
  job_apply_link?: string
  job_posted_at_datetime_utc?: string
  employer_logo?: string
  job_highlights?: { Qualifications?: string[] }
}

export async function searchJSearch(params: JobSearchParams): Promise<NormalizedJob[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return []

  try {
    const query = encodeURIComponent(params.query)
    const locationParts = [params.location, params.country].filter(Boolean).join(', ')
    const location = locationParts ? `&location=${encodeURIComponent(locationParts)}` : ''
    const remote = params.remote_only ? '&remote_jobs_only=true' : ''
    const page = params.page || 1

    const res = await fetch(
      `https://${RAPIDAPI_HOST}/search?query=${query}${location}${remote}&page=${page}&num_pages=1`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: JSearchResult[] = json.data || []

    return results.map((job): NormalizedJob => {
      const desc = job.job_description || ''
      const locationParts = [job.job_city, job.job_state, job.job_country].filter(Boolean)
      const salary =
        job.job_min_salary && job.job_max_salary
          ? `${job.job_salary_currency || '$'}${job.job_min_salary.toLocaleString()}-${job.job_max_salary.toLocaleString()}`
          : null

      return {
        id: `jsearch-${job.job_id || Math.random().toString(36).slice(2)}`,
        provider: 'jsearch',
        title: job.job_title || 'Untitled',
        company: job.employer_name || 'Unknown',
        location: locationParts.join(', ') || 'Not specified',
        remote: job.job_is_remote || false,
        salary,
        description: desc.slice(0, 500),
        full_description: desc,
        url: job.job_apply_link || '',
        posted_at: job.job_posted_at_datetime_utc || null,
        logo_url: job.employer_logo || null,
        tags: job.job_highlights?.Qualifications?.slice(0, 5) || [],
      }
    })
  } catch {
    return []
  }
}
