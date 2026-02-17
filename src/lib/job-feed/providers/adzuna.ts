import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface AdzunaResult {
  id?: string
  title?: string
  company?: { display_name?: string }
  location?: { display_name?: string }
  salary_min?: number
  salary_max?: number
  description?: string
  redirect_url?: string
  created?: string
  category?: { tag?: string }
}

export async function searchAdzuna(params: JobSearchParams): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  try {
    const query = encodeURIComponent(params.query)
    const location = params.location ? `&where=${encodeURIComponent(params.location)}` : ''
    const page = params.page || 1

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/${page}?app_id=${appId}&app_key=${appKey}&what=${query}${location}&results_per_page=20`,
      { signal: AbortSignal.timeout(10_000) }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: AdzunaResult[] = json.results || []

    return results.map((job): NormalizedJob => {
      const desc = job.description || ''
      const salary =
        job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min).toLocaleString()}-$${Math.round(job.salary_max).toLocaleString()}`
          : null

      return {
        id: `adzuna-${job.id || Math.random().toString(36).slice(2)}`,
        provider: 'adzuna',
        title: job.title || 'Untitled',
        company: job.company?.display_name || 'Unknown',
        location: job.location?.display_name || 'Not specified',
        remote: (job.title || '').toLowerCase().includes('remote') ||
                (job.location?.display_name || '').toLowerCase().includes('remote'),
        salary,
        description: desc.slice(0, 500),
        full_description: desc,
        url: job.redirect_url || '',
        posted_at: job.created || null,
        logo_url: null,
        tags: job.category?.tag ? [job.category.tag] : [],
      }
    })
  } catch {
    return []
  }
}
