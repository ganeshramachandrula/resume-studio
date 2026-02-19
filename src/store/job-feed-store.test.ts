import { describe, it, expect, beforeEach } from 'vitest'
import { useJobFeedStore, filterJobs } from '@/store/job-feed-store'
import type { NormalizedJob, JobFeedFilters } from '@/types/job-feed'

const makeJob = (overrides: Partial<NormalizedJob> = {}): NormalizedJob => ({
  id: '1',
  provider: 'jsearch',
  title: 'Engineer',
  company: 'Acme',
  location: 'Remote',
  remote: true,
  salary: null,
  description: 'Test',
  full_description: 'Test full',
  url: 'https://example.com',
  posted_at: '2026-02-15',
  logo_url: null,
  tags: ['react'],
  ...overrides,
})

const defaultFilters: JobFeedFilters = {
  providers: [],
  remote_only: false,
  location: '',
  sort_by: 'date',
  search_query: '',
  date_range: '30d',
}

describe('filterJobs', () => {
  it('returns all jobs when no filters are applied', () => {
    const jobs = [makeJob({ id: '1' }), makeJob({ id: '2' })]
    const result = filterJobs(jobs, defaultFilters)
    expect(result).toHaveLength(2)
  })

  it('filters by provider', () => {
    const jobs = [
      makeJob({ id: '1', provider: 'jsearch' }),
      makeJob({ id: '2', provider: 'adzuna' }),
      makeJob({ id: '3', provider: 'jsearch' }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, providers: ['jsearch'] })
    expect(result).toHaveLength(2)
    expect(result.every((j) => j.provider === 'jsearch')).toBe(true)
  })

  it('filters by remote only', () => {
    const jobs = [
      makeJob({ id: '1', remote: true }),
      makeJob({ id: '2', remote: false }),
      makeJob({ id: '3', remote: true }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, remote_only: true })
    expect(result).toHaveLength(2)
    expect(result.every((j) => j.remote)).toBe(true)
  })

  it('filters by location text (case insensitive)', () => {
    const jobs = [
      makeJob({ id: '1', location: 'San Francisco, CA' }),
      makeJob({ id: '2', location: 'New York, NY' }),
      makeJob({ id: '3', location: 'san francisco, ca' }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, location: 'san francisco' })
    expect(result).toHaveLength(2)
  })

  it('filters by search query matching title', () => {
    const jobs = [
      makeJob({ id: '1', title: 'Frontend Engineer' }),
      makeJob({ id: '2', title: 'Backend Developer' }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, search_query: 'frontend' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Frontend Engineer')
  })

  it('filters by search query matching company', () => {
    const jobs = [
      makeJob({ id: '1', company: 'Google' }),
      makeJob({ id: '2', company: 'Meta' }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, search_query: 'google' })
    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('Google')
  })

  it('filters by search query matching tags', () => {
    const jobs = [
      makeJob({ id: '1', tags: ['react', 'typescript'] }),
      makeJob({ id: '2', tags: ['python', 'django'] }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, search_query: 'typescript' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('sorts by date (newest first), null dates last', () => {
    const jobs = [
      makeJob({ id: '1', posted_at: '2026-02-05' }),
      makeJob({ id: '2', posted_at: '2026-02-18' }),
      makeJob({ id: '3', posted_at: null }),
      makeJob({ id: '4', posted_at: '2026-02-10' }),
    ]
    const result = filterJobs(jobs, { ...defaultFilters, sort_by: 'date' })
    expect(result.map((j) => j.id)).toEqual(['2', '4', '1', '3'])
  })

  it('applies combined filters together', () => {
    const jobs = [
      makeJob({ id: '1', provider: 'jsearch', remote: true, title: 'React Dev', location: 'Remote' }),
      makeJob({ id: '2', provider: 'adzuna', remote: true, title: 'React Eng', location: 'Remote' }),
      makeJob({ id: '3', provider: 'jsearch', remote: false, title: 'React Dev', location: 'NYC' }),
      makeJob({ id: '4', provider: 'jsearch', remote: true, title: 'Python Dev', location: 'Remote', tags: ['python'] }),
    ]
    const result = filterJobs(jobs, {
      providers: ['jsearch'],
      remote_only: true,
      location: '',
      sort_by: 'date',
      search_query: 'react',
      date_range: '30d',
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})

describe('job-feed-store', () => {
  beforeEach(() => {
    useJobFeedStore.getState().reset()
  })

  it('has correct initial state', () => {
    const state = useJobFeedStore.getState()
    expect(state.jobs).toEqual([])
    expect(state.preferences).toBeNull()
    expect(state.filters).toEqual(defaultFilters)
    expect(state.loading).toBe(false)
    expect(state.searching).toBe(false)
    expect(state.error).toBeNull()
    expect(state.totalResults).toBe(0)
    expect(state.remainingSearches).toBeNull()
    expect(state.providersQueried).toEqual([])
  })

  it('setJobs replaces jobs array', () => {
    const jobs = [makeJob({ id: '1' }), makeJob({ id: '2' })]
    useJobFeedStore.getState().setJobs(jobs)
    expect(useJobFeedStore.getState().jobs).toEqual(jobs)
  })

  it('setFilters merges with existing filters', () => {
    useJobFeedStore.getState().setFilters({ remote_only: true })
    useJobFeedStore.getState().setFilters({ location: 'NYC' })
    const filters = useJobFeedStore.getState().filters
    expect(filters.remote_only).toBe(true)
    expect(filters.location).toBe('NYC')
    expect(filters.providers).toEqual([])
    expect(filters.sort_by).toBe('date')
    expect(filters.search_query).toBe('')
  })

  it('setLoading updates loading state', () => {
    useJobFeedStore.getState().setLoading(true)
    expect(useJobFeedStore.getState().loading).toBe(true)
    useJobFeedStore.getState().setLoading(false)
    expect(useJobFeedStore.getState().loading).toBe(false)
  })

  it('setError sets and clears error', () => {
    useJobFeedStore.getState().setError('Network error')
    expect(useJobFeedStore.getState().error).toBe('Network error')
    useJobFeedStore.getState().setError(null)
    expect(useJobFeedStore.getState().error).toBeNull()
  })

  it('reset restores initial state', () => {
    useJobFeedStore.getState().setJobs([makeJob()])
    useJobFeedStore.getState().setFilters({ remote_only: true })
    useJobFeedStore.getState().setLoading(true)
    useJobFeedStore.getState().setError('err')
    useJobFeedStore.getState().setTotalResults(50)
    useJobFeedStore.getState().setRemainingSearches(3)
    useJobFeedStore.getState().setProvidersQueried(['jsearch'])

    useJobFeedStore.getState().reset()

    const state = useJobFeedStore.getState()
    expect(state.jobs).toEqual([])
    expect(state.filters).toEqual(defaultFilters)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.totalResults).toBe(0)
    expect(state.remainingSearches).toBeNull()
    expect(state.providersQueried).toEqual([])
  })
})
