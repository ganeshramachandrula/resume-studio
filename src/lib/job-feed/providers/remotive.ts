import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface RemotiveResult {
  id?: number
  title?: string
  company_name?: string
  candidate_required_location?: string
  salary?: string
  description?: string
  url?: string
  publication_date?: string
  company_logo_url?: string
  tags?: string[]
  category?: string
}

export async function searchRemotive(params: JobSearchParams): Promise<NormalizedJob[]> {
  try {
    const query = encodeURIComponent(params.query)

    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${query}&limit=20`,
      { signal: AbortSignal.timeout(10_000) }
    )

    if (!res.ok) return []

    const json = await res.json()
    const results: RemotiveResult[] = json.jobs || []

    return results.map((job): NormalizedJob => {
      const rawDesc = (job.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

      return {
        id: `remotive-${job.id || Math.random().toString(36).slice(2)}`,
        provider: 'remotive',
        title: job.title || 'Untitled',
        company: job.company_name || 'Unknown',
        location: job.candidate_required_location || 'Worldwide',
        remote: true,
        salary: job.salary || null,
        description: rawDesc.slice(0, 500),
        full_description: rawDesc,
        url: job.url || '',
        posted_at: job.publication_date || null,
        logo_url: job.company_logo_url || null,
        tags: [
          ...(job.tags || []),
          ...(job.category ? [job.category] : []),
        ],
      }
    })
  } catch {
    return []
  }
}
