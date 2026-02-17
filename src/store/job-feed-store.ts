import { create } from 'zustand'
import type { NormalizedJob, JobPreferences, JobFeedFilters, JobProvider } from '@/types/job-feed'

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

  setJobs: (jobs: NormalizedJob[]) => void
  setPreferences: (prefs: JobPreferences | null) => void
  setFilters: (filters: Partial<JobFeedFilters>) => void
  setLoading: (loading: boolean) => void
  setSearching: (searching: boolean) => void
  setError: (error: string | null) => void
  setTotalResults: (total: number) => void
  setRemainingSearches: (remaining: number | null) => void
  setProvidersQueried: (providers: string[]) => void
  reset: () => void
}

const defaultFilters: JobFeedFilters = {
  providers: [],
  remote_only: false,
  location: '',
  sort_by: 'date',
  search_query: '',
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
  reset: () => set(initialState),
}))

/**
 * Client-side filtering of jobs by the current filter state.
 */
export function filterJobs(jobs: NormalizedJob[], filters: JobFeedFilters): NormalizedJob[] {
  let filtered = [...jobs]

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

  // Sort
  if (filters.sort_by === 'date') {
    filtered.sort((a, b) => {
      if (!a.posted_at && !b.posted_at) return 0
      if (!a.posted_at) return 1
      if (!b.posted_at) return -1
      return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    })
  }

  return filtered
}
