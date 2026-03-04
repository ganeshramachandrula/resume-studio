'use client'

import { useState } from 'react'
import { StarRating } from './star-rating'
import { Loader2 } from 'lucide-react'

interface RatingFormProps {
  companyName?: string
  role?: string
  jobApplicationId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormState {
  company_name: string
  role: string
  response_time?: number
  ghosting_rate?: number
  interview_quality?: number
  offer_fairness?: number
  transparency?: number
  recruiter_professionalism?: number
  overall_recommendation?: number
  review_text: string
}

const DIMENSIONS = [
  { key: 'overall_recommendation' as const, label: 'Overall Recommendation', required: true },
  { key: 'response_time' as const, label: 'Response Time' },
  { key: 'ghosting_rate' as const, label: 'Ghosting Rate' },
  { key: 'interview_quality' as const, label: 'Interview Quality' },
  { key: 'offer_fairness' as const, label: 'Offer Fairness' },
  { key: 'transparency' as const, label: 'Transparency' },
  { key: 'recruiter_professionalism' as const, label: 'Recruiter Professionalism' },
]

export function RatingForm({ companyName = '', role = '', jobApplicationId, onSuccess, onCancel }: RatingFormProps) {
  const [form, setForm] = useState<FormState>({
    company_name: companyName,
    role,
    review_text: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company_name.trim()) {
      setError('Company name is required')
      return
    }
    if (!form.overall_recommendation) {
      setError('Overall recommendation is required')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/ghostboard/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          role: form.role || undefined,
          job_application_id: jobApplicationId,
          response_time: form.response_time,
          ghosting_rate: form.ghosting_rate,
          interview_quality: form.interview_quality,
          offer_fairness: form.offer_fairness,
          transparency: form.transparency,
          recruiter_professionalism: form.recruiter_professionalism,
          overall_recommendation: form.overall_recommendation,
          review_text: form.review_text || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit rating')
        return
      }

      setSuccess(true)
      onSuccess?.()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-lg font-semibold text-accent">Rating submitted!</p>
        <p className="text-sm text-gray-500 mt-1">Thanks for helping the community.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.company_name}
          onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
          placeholder="e.g. Google"
          maxLength={200}
          disabled={!!companyName}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/50 focus:border-brand disabled:bg-gray-50"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
        <input
          type="text"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="e.g. Senior Software Engineer"
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/50 focus:border-brand"
        />
      </div>

      {/* Star dimensions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DIMENSIONS.map(({ key, label, required }) => (
          <StarRating
            key={key}
            label={`${label}${required ? ' *' : ''}`}
            value={form[key]}
            onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
          />
        ))}
      </div>

      {/* Review text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review (optional)
        </label>
        <textarea
          value={form.review_text}
          onChange={(e) => setForm((f) => ({ ...f, review_text: e.target.value }))}
          placeholder="Share your experience..."
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/50 focus:border-brand resize-none"
        />
        <p className="text-xs text-gray-400 mt-0.5">{form.review_text.length}/2000</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Rating
        </button>
      </div>
    </form>
  )
}
