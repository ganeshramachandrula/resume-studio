import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface ArbeitnowResult {
  slug?: string
  title?: string
  company_name?: string
  location?: string
  remote?: boolean
  description?: string
  url?: string
  created_at?: string
  tags?: string[]
}

export async function searchArbeitnow(params: JobSearchParams): Promise<NormalizedJob[]> {
  try {
    const query = encodeURIComponent(params.query)
    const page = params.page || 1

    const res = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?search=${query}&page=${page}`,
      { signal: AbortSignal.timeout(10_000) }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: ArbeitnowResult[] = json.data || []

    return results.map((job): NormalizedJob => {
      const desc = (job.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

      return {
        id: `arbeitnow-${job.slug || Math.random().toString(36).slice(2)}`,
        provider: 'arbeitnow',
        title: job.title || 'Untitled',
        company: job.company_name || 'Unknown',
        location: job.location || 'Not specified',
        remote: job.remote || false,
        salary: null,
        description: desc.slice(0, 500),
        full_description: desc,
        url: job.url || '',
        posted_at: job.created_at || null,
        logo_url: null,
        tags: job.tags || [],
      }
    })
  } catch {
    return []
  }
}
