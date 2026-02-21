'use client'

import { useState, useCallback } from 'react'
import { aggregateJobInsights, type MarketInsights } from '@/lib/market-insights'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, TrendingUp, DollarSign, Wifi, Building2, Clock, Tag, Search } from 'lucide-react'
import { COUNTRIES } from '@/lib/job-feed/countries'
import type { NormalizedJob } from '@/types/job-feed'

function BarChart({ items, maxValue, color = 'bg-brand' }: { items: { label: string; value: number; suffix?: string }[]; maxValue: number; color?: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-400">No data available</p>
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-28 truncate shrink-0" title={item.label}>{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-12 text-right">{item.value}{item.suffix || ''}</span>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data }: { data: { remote: number; hybrid: number; onsite: number } }) {
  const total = data.remote + data.hybrid + data.onsite
  if (total === 0) return <p className="text-sm text-gray-400">No data</p>
  const segments = [
    { label: 'Remote', value: data.remote, color: 'bg-green-500', pct: Math.round((data.remote / total) * 100) },
    { label: 'Hybrid', value: data.hybrid, color: 'bg-amber-500', pct: Math.round((data.hybrid / total) * 100) },
    { label: 'On-site', value: data.onsite, color: 'bg-blue-500', pct: Math.round((data.onsite / total) * 100) },
  ].filter((s) => s.value > 0)

  return (
    <div className="space-y-3">
      <div className="flex h-6 rounded-full overflow-hidden">
        {segments.map((s) => (
          <div key={s.label} className={`${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${s.color}`} />
            <span className="text-xs text-gray-600">{s.label}: {s.value} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MarketInsightsPage() {
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')

  const fetchInsights = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ query: query.trim() })
      if (location) params.set('location', location)
      if (country) params.set('country', country)

      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          location: location || undefined,
          country: country || undefined,
          remote_only: false,
          page: 1,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs')

      const jobs: NormalizedJob[] = data.results || data.jobs || []
      if (jobs.length === 0) {
        setError('No jobs found. Try a different search query.')
        setInsights(null)
      } else {
        setInsights(aggregateJobInsights(jobs))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data')
    }
    setLoading(false)
  }, [query, location, country])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Market Insights</h1>
        <p className="text-gray-500 mt-1">Analyze job market trends, salary ranges, and in-demand skills.</p>
      </div>

      {/* Search controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Job title or keyword (e.g. Marketing Manager)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInsights()}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-36">
              <select
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={fetchInsights} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-xl border border-amber-200">{error}</div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand mb-3" />
          <p className="text-gray-500">Fetching and analyzing job market data...</p>
        </div>
      )}

      {insights && !loading && (
        <>
          {/* Summary stat */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {insights.totalJobs} jobs analyzed
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary ranges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Salary Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.salaryRanges.length > 0 ? (
                  <BarChart
                    items={insights.salaryRanges.map((s) => ({ label: s.label, value: s.count }))}
                    maxValue={Math.max(...insights.salaryRanges.map((s) => s.count), 1)}
                    color="bg-green-500"
                  />
                ) : (
                  <p className="text-sm text-gray-400">No salary data available in current results.</p>
                )}
              </CardContent>
            </Card>

            {/* Remote ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  Remote vs On-site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={insights.remoteRatio} />
              </CardContent>
            </Card>

            {/* Top skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-600" />
                  Most Requested Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={insights.topSkills.map((s) => ({ label: s.skill, value: s.count, suffix: ` (${s.percentage}%)` }))}
                  maxValue={Math.max(...insights.topSkills.map((s) => s.count), 1)}
                  color="bg-purple-500"
                />
              </CardContent>
            </Card>

            {/* Top companies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  Top Hiring Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={insights.topCompanies.map((c) => ({ label: c.company, value: c.count }))}
                  maxValue={Math.max(...insights.topCompanies.map((c) => c.count), 1)}
                  color="bg-amber-500"
                />
              </CardContent>
            </Card>

            {/* Posting freshness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-600" />
                  Posting Freshness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={insights.postingFreshness.map((p) => ({ label: p.period, value: p.count }))}
                  maxValue={Math.max(...insights.postingFreshness.map((p) => p.count), 1)}
                  color="bg-cyan-500"
                />
              </CardContent>
            </Card>

            {/* Trend summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                {insights.topSkills.length > 0 && (
                  <p>The most in-demand skill is <strong>{insights.topSkills[0].skill}</strong>, appearing in {insights.topSkills[0].percentage}% of listings.</p>
                )}
                {insights.remoteRatio.remote > 0 && (
                  <p>{Math.round((insights.remoteRatio.remote / insights.totalJobs) * 100)}% of positions offer remote work.</p>
                )}
                {insights.salaryRanges.length > 0 && (
                  <p>Most common salary range: <strong>{insights.salaryRanges.reduce((a, b) => b.count > a.count ? b : a).label}</strong>.</p>
                )}
                {insights.topCompanies.length > 0 && (
                  <p>Top hiring company: <strong>{insights.topCompanies[0].company}</strong> with {insights.topCompanies[0].count} listings.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!insights && !loading && !error && (
        <div className="text-center py-16">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Explore Market Trends</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Search for a job title to analyze salary ranges, in-demand skills, remote work availability, and hiring companies.
          </p>
        </div>
      )}
    </div>
  )
}
