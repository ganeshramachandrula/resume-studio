import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

interface RemoteOKResult {
  id?: string
  position?: string
  company?: string
  location?: string
  salary_min?: number
  salary_max?: number
  description?: string
  url?: string
  date?: string
  company_logo?: string
  tags?: string[]
}

export async function searchRemoteOK(params: JobSearchParams): Promise<NormalizedJob[]> {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'ResumeStudio/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) return []

    const json = await res.json()
    // First element is metadata, rest are jobs
    const results: RemoteOKResult[] = Array.isArray(json) ? json.slice(1) : []

    // Client-side filter by query — match any word from the query
    const queryWords = params.query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const filtered = results.filter((job) => {
      const text = `${job.position || ''} ${job.company || ''} ${(job.tags || []).join(' ')} ${job.description || ''}`.toLowerCase()
      return queryWords.some(word => text.includes(word))
    })

    return filtered.slice(0, 20).map((job): NormalizedJob => {
      const desc = (job.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const salary =
        job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()}`
          : null

      return {
        id: `remoteok-${job.id || Math.random().toString(36).slice(2)}`,
        provider: 'remoteok',
        title: job.position || 'Untitled',
        company: job.company || 'Unknown',
        location: job.location || 'Remote',
        remote: true,
        salary,
        description: desc.slice(0, 500),
        full_description: desc,
        url: job.url || '',
        posted_at: job.date || null,
        logo_url: job.company_logo || null,
        tags: job.tags || [],
      }
    })
  } catch {
    return []
  }
}
