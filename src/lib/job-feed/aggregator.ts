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

function hashQuery(params: JobSearchParams): string {
  const key = `${params.query}|${params.location || ''}|${params.remote_only || false}|${params.page || 1}`
  return createHash('sha256').update(key).digest('hex').slice(0, 32)
}

function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>()
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function sortByDate(jobs: NormalizedJob[]): NormalizedJob[] {
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
    const deduped = deduplicateJobs(freshCached)
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
        void supabase
          .from('job_feed_cache')
          .upsert(
            { query_hash: queryHash, provider, results: jobs as unknown as Record<string, unknown>[], fetched_at: new Date().toISOString() },
            { onConflict: 'query_hash,provider' }
          )
          .then(() => {})
      }
    }
  }

  const deduped = deduplicateJobs(freshJobs)
  const sorted = sortByDate(deduped)

  return {
    jobs: sorted.slice(0, maxResults),
    cached: false,
    providers: Array.from(queriedProviders),
  }
}
