import type { NormalizedJob, JobPreferences } from '@/types/job-feed'

export interface ScoredJob extends NormalizedJob {
  relevanceScore: number
}

/**
 * Score a job against user preferences (0-100).
 *
 * Breakdown:
 * - Skills match (0-50): % of user skills found in job title/tags/description
 * - Role match (0-30): % of user roles found in job title
 * - Location match (0-10): preferred location found in job location
 * - Remote match (0-10): remote preference alignment
 */
export function scoreJob(job: NormalizedJob, prefs: JobPreferences): number {
  let score = 0

  const jobText = `${job.title} ${(job.tags || []).join(' ')} ${job.description}`.toLowerCase()
  const jobTitle = job.title.toLowerCase()

  // Skills match (0-50)
  const skills = prefs.skills || []
  if (skills.length > 0) {
    const matched = skills.filter(s => jobText.includes(s.toLowerCase())).length
    score += Math.round((matched / skills.length) * 50)
  }

  // Role match (0-30)
  const roles = prefs.roles || []
  if (roles.length > 0) {
    const matched = roles.filter(r => jobTitle.includes(r.toLowerCase())).length
    score += Math.round((matched / roles.length) * 30)
  }

  // Location match (0-10)
  const locations = prefs.locations || []
  if (locations.length > 0) {
    const jobLoc = job.location.toLowerCase()
    const matched = locations.some(l => jobLoc.includes(l.toLowerCase()))
    if (matched) score += 10
  }

  // Remote match (0-10)
  if (prefs.remote_preference === 'remote' && job.remote) {
    score += 10
  } else if (prefs.remote_preference === 'onsite' && !job.remote) {
    score += 10
  } else if (prefs.remote_preference === 'any') {
    score += 5
  } else if (prefs.remote_preference === 'hybrid') {
    score += 5
  }

  return Math.min(score, 100)
}

/**
 * Score all jobs against preferences.
 */
export function scoreJobs(jobs: NormalizedJob[], prefs: JobPreferences): ScoredJob[] {
  return jobs.map(job => ({
    ...job,
    relevanceScore: scoreJob(job, prefs),
  }))
}
