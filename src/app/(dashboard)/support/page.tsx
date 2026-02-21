'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_LABELS } from '@/lib/constants'
import { MAX_SUPPORT_MESSAGE_LENGTH } from '@/lib/constants'
import { useAppStore } from '@/store/app-store'
import { Send, CheckCircle, LifeBuoy, ClipboardList, Mail } from 'lucide-react'

type SupportCase = {
  case_number: string
  subject: string
  category: string
  status: string
  created_at: string
  updated_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function SupportPage() {
  const { profile } = useAppStore()
  const [tab, setTab] = useState<'submit' | 'cases'>('submit')
  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    subject: '',
    message: '',
    category: 'general' as string,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [caseNumber, setCaseNumber] = useState('')
  const [cases, setCases] = useState<SupportCase[]>([])
  const [casesLoading, setCasesLoading] = useState(false)

  useEffect(() => {
    if (tab === 'cases') fetchCases()
  }, [tab])

  async function fetchCases() {
    setCasesLoading(true)
    try {
      const res = await fetch('/api/support/my-cases')
      if (res.ok) {
        const data = await res.json()
        setCases(data.cases ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setCasesLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send message')
        return
      }

      setCaseNumber(data.case_number || '')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-2xl font-display text-gray-900 mb-3">Support Case Submitted</h1>
        {caseNumber && (
          <p className="text-lg font-mono font-semibold text-brand mb-2">
            {caseNumber}
          </p>
        )}
        <p className="text-gray-500 mb-6">
          We&apos;ve received your request and will get back to you at{' '}
          <span className="font-medium text-gray-700">{form.email}</span>.
          {caseNumber && <> Save your case number <span className="font-mono font-medium">{caseNumber}</span> for reference.</>}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setSuccess(false); setCaseNumber(''); setForm({ ...form, subject: '', message: '', category: 'general' }) }}>
            Submit Another Case
          </Button>
          <Button onClick={() => { setSuccess(false); setTab('cases') }}>
            <ClipboardList className="h-4 w-4" /> View My Cases
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-gray-900">Support</h1>
          <p className="text-gray-500 text-sm mt-1">
            Having an issue or need help? Let us know and we&apos;ll get back to you.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('submit')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'submit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Case
          </button>
          <button
            onClick={() => setTab('cases')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'cases' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Cases
          </button>
        </div>
      </div>

      {tab === 'submit' ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What do you need help with?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      form.category === cat
                        ? 'bg-brand/10 text-brand border-2 border-brand/30'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {SUPPORT_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                Details <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, MAX_SUPPORT_MESSAGE_LENGTH) })}
                placeholder="Please describe the issue or question in detail..."
                className="resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.message.length}/{MAX_SUPPORT_MESSAGE_LENGTH}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Support Case
                </>
              )}
            </Button>
          </form>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Quick Tips</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>For billing issues, include your subscription plan and any error messages.</li>
              <li>For technical issues, describe the steps to reproduce the problem.</li>
              <li>For account access, include the email associated with your account.</li>
              <li>You can also email us directly at <a href="mailto:support@resume-studio.io" className="text-brand hover:underline">support@resume-studio.io</a>.</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {casesLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading your cases...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No support cases yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setTab('submit')}>
                Submit a Case
              </Button>
            </div>
          ) : (
            cases.map((c) => (
              <div key={c.case_number} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{c.case_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{c.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {SUPPORT_CATEGORY_LABELS[c.category] || c.category} &middot; {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
