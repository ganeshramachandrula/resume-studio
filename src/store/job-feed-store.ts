import { create } from 'zustand'
import type { NormalizedJob, JobPreferences, JobFeedFilters, JobProvider } from '@/types/job-feed'
import { scoreJobs, type ScoredJob } from '@/lib/job-feed/relevance'

interface JobFeedStore {
  jobs: NormalizedJob[]
  preferences: JobPreferences | null
  filters: JobFeedFilters
  loading: boolean
  searching: boolean
  error: string | null
  totalResults: number
  remainingSearches: number | null
  providersQueried: string[]
  ignoredJobIds: Set<string>

  setJobs: (jobs: NormalizedJob[]) => void
  setPreferences: (prefs: JobPreferences | null) => void
  setFilters: (filters: Partial<JobFeedFilters>) => void
  setLoading: (loading: boolean) => void
  setSearching: (searching: boolean) => void
  setError: (error: string | null) => void
  setTotalResults: (total: number) => void
  setRemainingSearches: (remaining: number | null) => void
  setProvidersQueried: (providers: string[]) => void
  setIgnoredJobIds: (ids: Set<string>) => void
  addIgnoredJob: (id: string) => void
  reset: () => void
}

const defaultFilters: JobFeedFilters = {
  providers: [],
  remote_only: false,
  location: '',
  sort_by: 'date',
  search_query: '',
  date_range: '30d',
}

const initialState = {
  jobs: [] as NormalizedJob[],
  preferences: null as JobPreferences | null,
  filters: defaultFilters,
  loading: false,
  searching: false,
  error: null as string | null,
  totalResults: 0,
  remainingSearches: null as number | null,
  providersQueried: [] as string[],
  ignoredJobIds: new Set<string>(),
}

export const useJobFeedStore = create<JobFeedStore>((set) => ({
  ...initialState,

  setJobs: (jobs) => set({ jobs }),
  setPreferences: (preferences) => set({ preferences }),
  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),
  setLoading: (loading) => set({ loading }),
  setSearching: (searching) => set({ searching }),
  setError: (error) => set({ error }),
  setTotalResults: (totalResults) => set({ totalResults }),
  setRemainingSearches: (remainingSearches) => set({ remainingSearches }),
  setProvidersQueried: (providersQueried) => set({ providersQueried }),
  setIgnoredJobIds: (ignoredJobIds) => set({ ignoredJobIds }),
  addIgnoredJob: (id) =>
    set((state) => {
      const next = new Set(state.ignoredJobIds)
      next.add(id)
      return { ignoredJobIds: next }
    }),
  reset: () => set({ ...initialState, ignoredJobIds: new Set<string>() }),
}))

/**
 * Client-side filtering of jobs by the current filter state.
 * Optionally scores jobs against preferences and filters out ignored jobs.
 */
export function filterJobs(
  jobs: NormalizedJob[],
  filters: JobFeedFilters,
  options?: { preferences?: JobPreferences | null; ignoredJobIds?: Set<string> }
): ScoredJob[] {
  let filtered = [...jobs]

  // Filter out ignored jobs first
  if (options?.ignoredJobIds && options.ignoredJobIds.size > 0) {
    filtered = filtered.filter((j) => !options.ignoredJobIds!.has(j.id))
  }

  // Filter by provider
  if (filters.providers.length > 0) {
    filtered = filtered.filter((j) => filters.providers.includes(j.provider as JobProvider))
  }

  // Filter by remote
  if (filters.remote_only) {
    filtered = filtered.filter((j) => j.remote)
  }

  // Filter by location text
  if (filters.location.trim()) {
    const loc = filters.location.toLowerCase()
    filtered = filtered.filter((j) => j.location.toLowerCase().includes(loc))
  }

  // Filter by date range
  if (filters.date_range) {
    const days = filters.date_range === '7d' ? 7 : filters.date_range === '14d' ? 14 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    filtered = filtered.filter((j) => {
      if (!j.posted_at) return true // keep jobs with unknown date
      return new Date(j.posted_at).getTime() >= cutoff
    })
  }

  // Filter by search query (client-side text filter)
  if (filters.search_query.trim()) {
    const q = filters.search_query.toLowerCase()
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  // Score against preferences
  const prefs = options?.preferences
  const scored: ScoredJob[] = prefs
    ? scoreJobs(filtered, prefs)
    : filtered.map((j) => ({ ...j, relevanceScore: 0 }))

  // Sort
  if (filters.sort_by === 'relevance' && prefs) {
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)
  } else {
    // Default: date sort
    scored.sort((a, b) => {
      if (!a.posted_at && !b.posted_at) return 0
      if (!a.posted_at) return 1
      if (!b.posted_at) return -1
      return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    })
  }

  return scored
}
