'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { aggregateAnalytics, type UserAnalytics } from '@/lib/analytics-helpers'
import { DOCUMENT_TYPE_LABELS, JOB_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, FileText, Target, TrendingUp, Trophy, Briefcase } from 'lucide-react'
import type { Document, JobApplication } from '@/types/database'

function BarChart({ items, maxValue, color = 'bg-brand' }: { items: { label: string; value: number }[]; maxValue: number; color?: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">No data yet</p>
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-28 truncate shrink-0">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext }: { icon: React.ElementType; label: string; value: string | number; subtext?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function ConversionFunnel({ data }: { data: { applied: number; interview: number; offer: number } }) {
  const maxVal = Math.max(data.applied, 1)
  const interviewRate = data.applied > 0 ? Math.round((data.interview / data.applied) * 100) : 0
  const offerRate = data.interview > 0 ? Math.round((data.offer / data.interview) * 100) : 0

  return (
    <div className="space-y-3">
      {[
        { label: 'Applied', value: data.applied, width: 100, color: 'bg-blue-500' },
        { label: 'Interview', value: data.interview, width: (data.interview / maxVal) * 100, color: 'bg-amber-500', rate: interviewRate },
        { label: 'Offer', value: data.offer, width: (data.offer / maxVal) * 100, color: 'bg-green-500', rate: offerRate },
      ].map((stage) => (
        <div key={stage.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{stage.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{stage.value}</span>
              {'rate' in stage && stage.rate !== undefined && (
                <Badge variant="secondary" className="text-xs">{stage.rate}%</Badge>
              )}
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${stage.color} rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(stage.width, stage.value > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniTimeline({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 bg-brand/70 rounded-t-sm min-h-[2px] transition-all"
          style={{ height: `${(d.count / maxCount) * 100}%` }}
          title={`${d.date}: ${d.count} documents`}
        />
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const [docsResult, appsResult] = await Promise.all([
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('job_applications').select('*').order('created_at', { ascending: false }),
      ])

      const documents = (docsResult.data || []) as Document[]
      const applications = (appsResult.data || []) as JobApplication[]

      setAnalytics(aggregateAnalytics(documents, applications))
      setLoading(false)
    }
    void loadData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your job search progress.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your job search progress and document performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Documents Created" value={analytics.totalDocuments} />
        <StatCard icon={Briefcase} label="Applications" value={analytics.totalApplications} />
        <StatCard
          icon={Target}
          label="Average ATS Score"
          value={analytics.averageATSScore > 0 ? `${analytics.averageATSScore}%` : '--'}
        />
        <StatCard
          icon={Trophy}
          label="Top Resume"
          value={analytics.topPerformingResume?.interviews ?? 0}
          subtext={analytics.topPerformingResume?.title || 'No interview data'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" />
              Documents by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              items={analytics.documentsCreated.map((d) => ({
                label: DOCUMENT_TYPE_LABELS[d.type] || d.type,
                value: d.count,
              }))}
              maxValue={Math.max(...analytics.documentsCreated.map((d) => d.count), 1)}
            />
          </CardContent>
        </Card>

        {/* Application funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.totalApplications > 0 ? (
              <ConversionFunnel data={analytics.conversionRate} />
            ) : (
              <p className="text-sm text-gray-400">Start tracking applications in Job Tracker to see your funnel.</p>
            )}
          </CardContent>
        </Card>

        {/* Application outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)]">Application Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              items={analytics.applicationOutcomes.map((a) => ({
                label: JOB_STATUS_LABELS[a.status] || a.status,
                value: a.count,
              }))}
              maxValue={Math.max(...analytics.applicationOutcomes.map((a) => a.count), 1)}
              color="bg-accent"
            />
          </CardContent>
        </Card>

        {/* Activity timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)]">Document Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.documentsOverTime.some((d) => d.count > 0) ? (
              <MiniTimeline data={analytics.documentsOverTime} />
            ) : (
              <p className="text-sm text-gray-400">No documents created in the last 30 days.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
