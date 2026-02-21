import type { Document, JobApplication } from '@/types/database'

export interface UserAnalytics {
  documentsCreated: { type: string; count: number }[]
  documentsOverTime: { date: string; count: number }[]
  averageATSScore: number
  atsScoreTrend: { date: string; score: number }[]
  applicationOutcomes: { status: string; count: number }[]
  conversionRate: { applied: number; interview: number; offer: number }
  topPerformingResume: { title: string; interviews: number } | null
  totalDocuments: number
  totalApplications: number
}

export function aggregateAnalytics(
  documents: Document[],
  applications: JobApplication[]
): UserAnalytics {
  // Documents by type
  const typeCounts = new Map<string, number>()
  for (const doc of documents) {
    typeCounts.set(doc.type, (typeCounts.get(doc.type) || 0) + 1)
  }
  const documentsCreated = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Documents over time (last 30 days)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dateCounts = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    dateCounts.set(d.toISOString().slice(0, 10), 0)
  }
  for (const doc of documents) {
    const date = doc.created_at.slice(0, 10)
    if (dateCounts.has(date)) {
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
    }
  }
  const documentsOverTime = Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ATS scores
  const docsWithATS = documents
    .filter((d) => d.ats_score !== null && d.ats_score !== undefined)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const averageATSScore = docsWithATS.length > 0
    ? Math.round(docsWithATS.reduce((sum, d) => sum + (d.ats_score || 0), 0) / docsWithATS.length)
    : 0
  const atsScoreTrend = docsWithATS.map((d) => ({
    date: d.created_at.slice(0, 10),
    score: d.ats_score || 0,
  }))

  // Application outcomes
  const statusCounts = new Map<string, number>()
  for (const app of applications) {
    statusCounts.set(app.status, (statusCounts.get(app.status) || 0) + 1)
  }
  const applicationOutcomes = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))

  // Conversion rates
  const totalApplied = applications.filter((a) => a.status !== 'saved').length
  const totalInterview = applications.filter((a) => a.status === 'interview' || a.status === 'offer').length
  const totalOffer = applications.filter((a) => a.status === 'offer').length
  const conversionRate = {
    applied: totalApplied,
    interview: totalInterview,
    offer: totalOffer,
  }

  // Top performing resume (which resume led to most interviews)
  const interviewApps = applications.filter((a) => a.status === 'interview' || a.status === 'offer')
  const resumeInterviewCounts = new Map<string, { title: string; count: number }>()
  for (const app of interviewApps) {
    for (const docId of app.document_ids || []) {
      const doc = documents.find((d) => d.id === docId && d.type === 'resume')
      if (doc) {
        const existing = resumeInterviewCounts.get(doc.id)
        if (existing) {
          existing.count++
        } else {
          resumeInterviewCounts.set(doc.id, { title: doc.title, count: 1 })
        }
      }
    }
  }
  let topPerformingResume: { title: string; interviews: number } | null = null
  let maxInterviews = 0
  for (const [, value] of resumeInterviewCounts) {
    if (value.count > maxInterviews) {
      maxInterviews = value.count
      topPerformingResume = { title: value.title, interviews: value.count }
    }
  }

  return {
    documentsCreated,
    documentsOverTime,
    averageATSScore,
    atsScoreTrend,
    applicationOutcomes,
    conversionRate,
    topPerformingResume,
    totalDocuments: documents.length,
    totalApplications: applications.length,
  }
}
