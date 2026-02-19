import { createServerClient } from '@supabase/ssr'
import { createHash } from 'crypto'
import type { NormalizedJob, JobSearchParams, JobProvider } from '@/types/job-feed'
import { searchJSearch } from './providers/jsearch'
import { searchAdzuna } from './providers/adzuna'
import { searchTheMuse } from './providers/themuse'
import { searchRemotive } from './providers/remotive'
import { searchRemoteOK } from './providers/remoteok'
import { searchArbeitnow } from './providers/arbeitnow'
import { searchFindwork } from './providers/findwork'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

type ProviderFn = (params: JobSearchParams) => Promise<NormalizedJob[]>

const PROVIDER_MAP: Record<JobProvider, ProviderFn> = {
  jsearch: searchJSearch,
  adzuna: searchAdzuna,
  themuse: searchTheMuse,
  remotive: searchRemotive,
  remoteok: searchRemoteOK,
  arbeitnow: searchArbeitnow,
  findwork: searchFindwork,
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

export function hashQuery(params: JobSearchParams): string {
  const key = `${params.query}|${params.location || ''}|${params.country || ''}|${params.remote_only || false}|${params.page || 1}`
  return createHash('sha256').update(key).digest('hex').slice(0, 32)
}

export function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>()
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Filter jobs by relevance to the search query.
 * Checks if any meaningful word from the query appears in the job title,
 * company, tags, or description.
 */
export function filterByRelevance(jobs: NormalizedJob[], params: JobSearchParams): NormalizedJob[] {
  const queryWords = params.query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  if (queryWords.length === 0) return jobs

  return jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${(job.tags || []).join(' ')} ${job.description}`.toLowerCase()
    return queryWords.some(word => text.includes(word))
  })
}

/**
 * Filter jobs by location, country, and remote preference.
 */
export function filterByLocation(jobs: NormalizedJob[], params: JobSearchParams): NormalizedJob[] {
  let filtered = jobs

  // If remote_only is set, keep only remote jobs
  if (params.remote_only) {
    filtered = filtered.filter(job => job.remote)
  }

  // If location is specified, filter by location text match
  if (params.location) {
    const loc = params.location.toLowerCase()
    if (loc === 'remote') {
      filtered = filtered.filter(job => job.remote)
    } else {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(loc)
      )
    }
  }

  // If country is specified, filter jobs whose location mentions the country
  if (params.country) {
    const countryCode = params.country.toUpperCase()
    const countryLower = params.country.toLowerCase()
    // Map codes to full names for matching against job location text
    const COUNTRY_NAMES: Record<string, string> = {
      US: 'united states', GB: 'united kingdom', CA: 'canada', AU: 'australia',
      DE: 'germany', FR: 'france', NL: 'netherlands', ES: 'spain', IT: 'italy',
      PL: 'poland', IN: 'india', NZ: 'new zealand', BR: 'brazil', SG: 'singapore',
      AT: 'austria', CH: 'switzerland', SE: 'sweden', IE: 'ireland', JP: 'japan',
      ZA: 'south africa',
    }
    const countryName = COUNTRY_NAMES[countryCode] || ''
    filtered = filtered.filter(job => {
      const loc = job.location.toLowerCase()
      // Keep if location mentions country code, country name, or is generic (remote/not specified)
      return (
        loc.includes(countryLower) ||
        (countryName && loc.includes(countryName)) ||
        loc === 'not specified' ||
        loc === 'remote' ||
        loc === 'worldwide' ||
        (job.remote && !params.location) // remote jobs pass only when no city is specified
      )
    })
  }

  return filtered
}

export function sortByDate(jobs: NormalizedJob[]): NormalizedJob[] {
  return jobs.sort((a, b) => {
    if (!a.posted_at && !b.posted_at) return 0
    if (!a.posted_at) return 1
    if (!b.posted_at) return -1
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  })
}

export async function searchAllProviders(
  params: JobSearchParams,
  maxResults: number
): Promise<{ jobs: NormalizedJob[]; cached: boolean; providers: string[] }> {
  const supabase = getAdminClient()
  const queryHash = hashQuery(params)
  const providers = Object.keys(PROVIDER_MAP) as JobProvider[]

  // Check cache first
  const { data: cached } = await supabase
    .from('job_feed_cache')
    .select('provider, results, fetched_at')
    .eq('query_hash', queryHash)

  const now = Date.now()
  const freshCached: NormalizedJob[] = []
  const cachedProviders = new Set<string>()
  const staleProviders: JobProvider[] = []

  if (cached && cached.length > 0) {
    for (const row of cached) {
      const age = now - new Date(row.fetched_at).getTime()
      if (age < CACHE_TTL_MS) {
        freshCached.push(...(row.results as NormalizedJob[]))
        cachedProviders.add(row.provider)
      } else {
        staleProviders.push(row.provider as JobProvider)
      }
    }
  }

  // Determine which providers need fresh queries
  const providersToQuery = providers.filter(
    (p) => !cachedProviders.has(p) || staleProviders.includes(p)
  )

  if (providersToQuery.length === 0) {
    // All providers cached
    const relevant = filterByRelevance(freshCached, params)
    const located = filterByLocation(relevant, params)
    const deduped = deduplicateJobs(located)
    const sorted = sortByDate(deduped)
    return {
      jobs: sorted.slice(0, maxResults),
      cached: true,
      providers: Array.from(cachedProviders),
    }
  }

  // Query uncached providers in parallel
  const results = await Promise.allSettled(
    providersToQuery.map(async (provider) => {
      const fn = PROVIDER_MAP[provider]
      const jobs = await fn(params)
      return { provider, jobs }
    })
  )

  const freshJobs: NormalizedJob[] = [...freshCached]
  const queriedProviders = new Set<string>(cachedProviders)

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { provider, jobs } = result.value
      freshJobs.push(...jobs)
      queriedProviders.add(provider)

      // Cache the results (fire and forget)
      if (jobs.length > 0) {
        Promise.resolve(
          supabase
            .from('job_feed_cache')
            .upsert(
              { query_hash: queryHash, provider, results: jobs as unknown as Record<string, unknown>[], fetched_at: new Date().toISOString() },
              { onConflict: 'query_hash,provider' }
            )
        ).catch(() => {})
      }
    }
  }

  const relevant = filterByRelevance(freshJobs, params)
  const located = filterByLocation(relevant, params)
  const deduped = deduplicateJobs(located)
  const sorted = sortByDate(deduped)

  return {
    jobs: sorted.slice(0, maxResults),
    cached: false,
    providers: Array.from(queriedProviders),
  }
}
