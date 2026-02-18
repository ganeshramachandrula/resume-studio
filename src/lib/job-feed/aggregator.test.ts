import { describe, it, expect } from 'vitest'
import { hashQuery, deduplicateJobs, sortByDate } from '@/lib/job-feed/aggregator'
import type { NormalizedJob, JobSearchParams } from '@/types/job-feed'

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
  posted_at: '2026-01-01',
  logo_url: null,
  tags: ['react'],
  ...overrides,
})

describe('hashQuery', () => {
  it('returns a 32-character hex string', () => {
    const hash = hashQuery({ query: 'react developer' })
    expect(hash).toHaveLength(32)
    expect(hash).toMatch(/^[0-9a-f]{32}$/)
  })

  it('returns same hash for same params', () => {
    const params: JobSearchParams = { query: 'react', location: 'NYC', remote_only: true, page: 1 }
    const hash1 = hashQuery(params)
    const hash2 = hashQuery(params)
    expect(hash1).toBe(hash2)
  })

  it('returns different hash for different query', () => {
    const hash1 = hashQuery({ query: 'react developer' })
    const hash2 = hashQuery({ query: 'python developer' })
    expect(hash1).not.toBe(hash2)
  })

  it('returns different hash for different location', () => {
    const hash1 = hashQuery({ query: 'react', location: 'NYC' })
    const hash2 = hashQuery({ query: 'react', location: 'LA' })
    expect(hash1).not.toBe(hash2)
  })

  it('returns different hash for different remote_only', () => {
    const hash1 = hashQuery({ query: 'react', remote_only: true })
    const hash2 = hashQuery({ query: 'react', remote_only: false })
    expect(hash1).not.toBe(hash2)
  })
})

describe('deduplicateJobs', () => {
  it('removes exact title+company duplicates (case insensitive)', () => {
    const jobs = [
      makeJob({ id: '1', title: 'Engineer', company: 'Acme' }),
      makeJob({ id: '2', title: 'engineer', company: 'acme' }),
      makeJob({ id: '3', title: 'ENGINEER', company: 'ACME' }),
    ]
    const result = deduplicateJobs(jobs)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('keeps jobs with different titles', () => {
    const jobs = [
      makeJob({ id: '1', title: 'Frontend Engineer', company: 'Acme' }),
      makeJob({ id: '2', title: 'Backend Engineer', company: 'Acme' }),
    ]
    const result = deduplicateJobs(jobs)
    expect(result).toHaveLength(2)
  })

  it('keeps jobs with different companies', () => {
    const jobs = [
      makeJob({ id: '1', title: 'Engineer', company: 'Acme' }),
      makeJob({ id: '2', title: 'Engineer', company: 'Globex' }),
    ]
    const result = deduplicateJobs(jobs)
    expect(result).toHaveLength(2)
  })

  it('preserves order (keeps first occurrence)', () => {
    const jobs = [
      makeJob({ id: 'first', title: 'Dev', company: 'Co', provider: 'jsearch' }),
      makeJob({ id: 'second', title: 'Dev', company: 'Co', provider: 'adzuna' }),
    ]
    const result = deduplicateJobs(jobs)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('first')
    expect(result[0].provider).toBe('jsearch')
  })
})

describe('sortByDate', () => {
  it('sorts newest first', () => {
    const jobs = [
      makeJob({ id: '1', posted_at: '2026-01-01' }),
      makeJob({ id: '2', posted_at: '2026-02-15' }),
      makeJob({ id: '3', posted_at: '2026-01-10' }),
    ]
    const result = sortByDate(jobs)
    expect(result.map((j) => j.id)).toEqual(['2', '3', '1'])
  })

  it('pushes null dates to the end', () => {
    const jobs = [
      makeJob({ id: '1', posted_at: null }),
      makeJob({ id: '2', posted_at: '2026-02-01' }),
      makeJob({ id: '3', posted_at: null }),
      makeJob({ id: '4', posted_at: '2026-01-01' }),
    ]
    const result = sortByDate(jobs)
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('4')
    // Null dates are last
    expect(result[2].posted_at).toBeNull()
    expect(result[3].posted_at).toBeNull()
  })

  it('returns empty array for empty input', () => {
    const result = sortByDate([])
    expect(result).toEqual([])
  })
})
