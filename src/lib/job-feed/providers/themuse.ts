import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface TheMuseResult {
  id?: number
  name?: string
  company?: { name?: string }
  locations?: { name?: string }[]
  levels?: { name?: string }[]
  contents?: string
  refs?: { landing_page?: string }
  publication_date?: string
  categories?: { name?: string }[]
}

export async function searchTheMuse(params: JobSearchParams): Promise<NormalizedJob[]> {
  try {
    const location = params.location ? `&location=${encodeURIComponent(params.location)}` : ''
    const page = params.page || 1

    const res = await fetch(
      `https://www.themuse.com/api/public/jobs?page=${page - 1}&descending=true${location}`,
      { signal: AbortSignal.timeout(10_000) }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: TheMuseResult[] = json.results || []

    return results.map((job): NormalizedJob => {
      // Strip HTML from contents
      const rawDesc = (job.contents || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const locationStr = job.locations?.map((l) => l.name).join(', ') || 'Not specified'
      const isRemote = locationStr.toLowerCase().includes('remote') ||
                       locationStr.toLowerCase().includes('flexible')

      return {
        id: `themuse-${job.id || Math.random().toString(36).slice(2)}`,
        provider: 'themuse',
        title: job.name || 'Untitled',
        company: job.company?.name || 'Unknown',
        location: locationStr,
        remote: isRemote,
        salary: null,
        description: rawDesc.slice(0, 500),
        full_description: rawDesc,
        url: job.refs?.landing_page || '',
        posted_at: job.publication_date || null,
        logo_url: null,
        tags: [
          ...(job.levels?.map((l) => l.name || '') || []),
          ...(job.categories?.map((c) => c.name || '') || []),
        ].filter(Boolean),
      }
    })
  } catch {
    return []
  }
}
