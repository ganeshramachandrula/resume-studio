'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Ghost, TrendingDown, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { StarDisplay } from './star-rating'
import { RatingForm } from './rating-form'
import type { CompanyProfile } from '@/types/database'

interface CompaniesResponse {
  success: boolean
  data: CompanyProfile[]
  total: number
  page: number
  limit: number
}

export function GhostBoardContent() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [topRated, setTopRated] = useState<CompanyProfile[]>([])
  const [worstGhosters, setWorstGhosters] = useState<CompanyProfile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page on search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/ghostboard/companies?${params}`)
      const data: CompaniesResponse = await res.json()
      if (data.success) {
        setCompanies(data.data)
        setTotal(data.total)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // Fetch leaderboards once
  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        const [topRes, ghostRes] = await Promise.all([
          fetch('/api/ghostboard/companies?sort=avg_overall_recommendation&limit=5'),
          fetch('/api/ghostboard/companies?sort=avg_ghosting_rate&limit=5'),
        ])
        const topData: CompaniesResponse = await topRes.json()
        const ghostData: CompaniesResponse = await ghostRes.json()
        if (topData.success) setTopRated(topData.data)
        if (ghostData.success) setWorstGhosters(ghostData.data)
      } catch {
        // silent
      }
    }
    fetchLeaderboards()
  }, [])

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
            <Ghost className="h-4 w-4" />
            Community-Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
            GhostBoard: Rate Your{' '}
            <span className="text-accent">Hiring Experience</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Hold companies accountable. Rate response times, ghosting behavior,
            interview quality, and more. Help fellow job seekers avoid the worst
            hiring experiences.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Rate a Company
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Inline rating form */}
        {showForm && (
          <div className="mb-12 max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Rate a Company</h2>
            <RatingForm
              onSuccess={() => {
                setShowForm(false)
                fetchCompanies()
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Leaderboards */}
        {(topRated.length > 0 || worstGhosters.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {topRated.length > 0 && (
              <LeaderboardCard
                title="Top Rated"
                icon={Award}
                iconColor="text-accent"
                companies={topRated}
              />
            )}
            {worstGhosters.length > 0 && (
              <LeaderboardCard
                title="Worst Ghosters"
                icon={TrendingDown}
                iconColor="text-red-500"
                companies={worstGhosters}
                dimension="avg_ghosting_rate"
              />
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/50 focus:border-brand"
          />
        </div>

        {/* Company grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Ghost className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No companies found. Be the first to rate one!</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((c) => (
                <CompanyCard key={c.company_slug} company={c} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CompanyCard({ company }: { company: CompanyProfile }) {
  return (
    <Link
      href={`/ghostboard/${company.company_slug}`}
      className="block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{company.company_name}</h3>
        <span className="text-xs text-gray-400">{company.total_ratings} ratings</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <StarDisplay value={company.avg_overall_recommendation} size="sm" />
        <span className="text-sm font-medium text-gray-700">
          {company.avg_overall_recommendation?.toFixed(1) ?? 'N/A'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {company.avg_response_time !== null && (
          <span>Response: {company.avg_response_time.toFixed(1)}</span>
        )}
        {company.avg_ghosting_rate !== null && (
          <span>Ghosting: {company.avg_ghosting_rate.toFixed(1)}</span>
        )}
        {company.avg_interview_quality !== null && (
          <span>Interview: {company.avg_interview_quality.toFixed(1)}</span>
        )}
      </div>
    </Link>
  )
}

function LeaderboardCard({
  title,
  icon: Icon,
  iconColor,
  companies,
  dimension = 'avg_overall_recommendation',
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  companies: CompanyProfile[]
  dimension?: keyof CompanyProfile
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3">
        {companies.map((c, i) => (
          <Link
            key={c.company_slug}
            href={`/ghostboard/${c.company_slug}`}
            className="flex items-center gap-3 group"
          >
            <span className="text-sm font-medium text-gray-400 w-5">{i + 1}</span>
            <span className="text-sm text-gray-900 group-hover:text-brand flex-1">
              {c.company_name}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {(c[dimension] as number | null)?.toFixed(1) ?? 'N/A'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
