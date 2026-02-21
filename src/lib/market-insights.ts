import type { NormalizedJob } from '@/types/job-feed'

export interface MarketInsights {
  totalJobs: number
  salaryRanges: { label: string; min: number; max: number; count: number }[]
  topSkills: { skill: string; count: number; percentage: number }[]
  remoteRatio: { remote: number; hybrid: number; onsite: number }
  topCompanies: { company: string; count: number }[]
  postingFreshness: { period: string; count: number }[]
}

function parseSalary(salary: string | null): { min: number; max: number } | null {
  if (!salary) return null
  // Extract numbers from salary strings like "$90,000 - $120,000", "90k-120k", "$50/hr"
  const numbers = salary.replace(/,/g, '').match(/\d+\.?\d*/g)
  if (!numbers || numbers.length === 0) return null

  let values = numbers.map(Number)
  // Handle 'k' shorthand
  if (salary.toLowerCase().includes('k')) {
    values = values.map((v) => (v < 1000 ? v * 1000 : v))
  }
  // Handle hourly rates (multiply by 2080 for annual)
  if (salary.toLowerCase().includes('/hr') || salary.toLowerCase().includes('per hour') || salary.toLowerCase().includes('hourly')) {
    values = values.map((v) => (v < 500 ? v * 2080 : v))
  }

  if (values.length >= 2) {
    return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) }
  }
  return { min: values[0], max: values[0] }
}

function getSalaryBucket(salary: number): string {
  if (salary < 50000) return '<$50K'
  if (salary < 75000) return '$50K-$75K'
  if (salary < 100000) return '$75K-$100K'
  if (salary < 125000) return '$100K-$125K'
  if (salary < 150000) return '$125K-$150K'
  if (salary < 200000) return '$150K-$200K'
  return '$200K+'
}

const SALARY_BUCKET_ORDER = ['<$50K', '$50K-$75K', '$75K-$100K', '$100K-$125K', '$125K-$150K', '$150K-$200K', '$200K+']

function getDaysSincePosted(postedAt: string | null): number | null {
  if (!postedAt) return null
  const posted = new Date(postedAt)
  if (isNaN(posted.getTime())) return null
  const now = new Date()
  return Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))
}

export function aggregateJobInsights(jobs: NormalizedJob[]): MarketInsights {
  // Salary ranges
  const salaryBuckets = new Map<string, { min: number; max: number; count: number }>()
  for (const job of jobs) {
    const parsed = parseSalary(job.salary)
    if (!parsed) continue
    const avg = (parsed.min + parsed.max) / 2
    const bucket = getSalaryBucket(avg)
    const existing = salaryBuckets.get(bucket)
    if (existing) {
      existing.min = Math.min(existing.min, parsed.min)
      existing.max = Math.max(existing.max, parsed.max)
      existing.count++
    } else {
      salaryBuckets.set(bucket, { min: parsed.min, max: parsed.max, count: 1 })
    }
  }
  const salaryRanges = SALARY_BUCKET_ORDER
    .filter((label) => salaryBuckets.has(label))
    .map((label) => ({
      label,
      ...salaryBuckets.get(label)!,
    }))

  // Top skills from tags
  const skillCounts = new Map<string, number>()
  for (const job of jobs) {
    for (const tag of job.tags || []) {
      const normalized = tag.trim()
      if (normalized) {
        skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1)
      }
    }
  }
  const topSkills = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Remote ratio
  let remote = 0
  let onsite = 0
  for (const job of jobs) {
    if (job.remote) {
      remote++
    } else {
      onsite++
    }
  }
  const hybrid = 0 // normalized jobs don't have hybrid flag, but we can infer from location text
  const remoteRatio = { remote, hybrid, onsite }

  // Top companies
  const companyCounts = new Map<string, number>()
  for (const job of jobs) {
    if (job.company) {
      companyCounts.set(job.company, (companyCounts.get(job.company) || 0) + 1)
    }
  }
  const topCompanies = Array.from(companyCounts.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Posting freshness
  const freshnessBuckets = new Map<string, number>([
    ['Today', 0],
    ['1-3 days', 0],
    ['4-7 days', 0],
    ['1-2 weeks', 0],
    ['2+ weeks', 0],
    ['Unknown', 0],
  ])
  for (const job of jobs) {
    const days = getDaysSincePosted(job.posted_at)
    if (days === null) {
      freshnessBuckets.set('Unknown', (freshnessBuckets.get('Unknown') || 0) + 1)
    } else if (days === 0) {
      freshnessBuckets.set('Today', (freshnessBuckets.get('Today') || 0) + 1)
    } else if (days <= 3) {
      freshnessBuckets.set('1-3 days', (freshnessBuckets.get('1-3 days') || 0) + 1)
    } else if (days <= 7) {
      freshnessBuckets.set('4-7 days', (freshnessBuckets.get('4-7 days') || 0) + 1)
    } else if (days <= 14) {
      freshnessBuckets.set('1-2 weeks', (freshnessBuckets.get('1-2 weeks') || 0) + 1)
    } else {
      freshnessBuckets.set('2+ weeks', (freshnessBuckets.get('2+ weeks') || 0) + 1)
    }
  }
  const postingFreshness = Array.from(freshnessBuckets.entries())
    .map(([period, count]) => ({ period, count }))
    .filter((p) => p.count > 0)

  return {
    totalJobs: jobs.length,
    salaryRanges,
    topSkills,
    remoteRatio,
    topCompanies,
    postingFreshness,
  }
}
