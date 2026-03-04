'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ghost, ChevronLeft, ChevronRight } from 'lucide-react'
import { StarDisplay } from './star-rating'
import { RatingForm } from './rating-form'
import type { CompanyProfile, CompanyRating } from '@/types/database'

interface CompanyDetailProps {
  slug: string
}

const DIMENSION_LABELS: { key: string; label: string }[] = [
  { key: 'avg_overall_recommendation', label: 'Overall' },
  { key: 'avg_response_time', label: 'Response Time' },
  { key: 'avg_ghosting_rate', label: 'Ghosting Rate' },
  { key: 'avg_interview_quality', label: 'Interview Quality' },
  { key: 'avg_offer_fairness', label: 'Offer Fairness' },
  { key: 'avg_transparency', label: 'Transparency' },
  { key: 'avg_recruiter_professionalism', label: 'Recruiter Professionalism' },
]

export function CompanyDetail({ slug }: CompanyDetailProps) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [reviews, setReviews] = useState<CompanyRating[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ghostboard/companies/${slug}?page=${page}&limit=10`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        setReviews(data.reviews)
        setTotalReviews(data.total_reviews)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [slug, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Ghost className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Company not found</p>
        <Link href="/ghostboard" className="text-brand hover:underline text-sm">
          Back to GhostBoard
        </Link>
      </div>
    )
  }

  const totalPages = Math.ceil(totalReviews / 10)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/ghostboard"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to GhostBoard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
            {profile.company_name}
          </h1>
          <div className="flex items-center gap-3">
            <StarDisplay value={profile.avg_overall_recommendation} size="md" />
            <span className="text-lg font-medium">
              {profile.avg_overall_recommendation?.toFixed(1) ?? 'N/A'}
            </span>
            <span className="text-gray-400 text-sm">
              ({profile.total_ratings} rating{profile.total_ratings !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Dimension bars */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {DIMENSION_LABELS.map(({ key, label }) => {
            const val = profile[key as keyof CompanyProfile] as number | null
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-44 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: val ? `${(val / 5) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">
                  {val?.toFixed(1) ?? '-'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Rate CTA */}
        <div className="mb-10">
          {showForm ? (
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Rate {profile.company_name}</h2>
              <RatingForm
                companyName={profile.company_name}
                onSuccess={() => {
                  setShowForm(false)
                  fetchData()
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark"
            >
              Rate This Company
            </button>
          )}
        </div>

        {/* Reviews */}
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarDisplay value={r.overall_recommendation} size="sm" />
                  {r.role && (
                    <span className="text-xs text-gray-500">{r.role}</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.review_text && (
                  <p className="text-sm text-gray-700">{r.review_text}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                  {r.response_time && <span>Response: {r.response_time}/5</span>}
                  {r.ghosting_rate && <span>Ghosting: {r.ghosting_rate}/5</span>}
                  {r.interview_quality && <span>Interview: {r.interview_quality}/5</span>}
                  {r.offer_fairness && <span>Fairness: {r.offer_fairness}/5</span>}
                  {r.transparency && <span>Transparency: {r.transparency}/5</span>}
                  {r.recruiter_professionalism && <span>Recruiter: {r.recruiter_professionalism}/5</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
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
      </div>
    </div>
  )
}
