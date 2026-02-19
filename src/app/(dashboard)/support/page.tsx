'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_LABELS, MAX_SUPPORT_MESSAGE_LENGTH } from '@/lib/constants'
import { useAppStore } from '@/store/app-store'
import { Send, CheckCircle, LifeBuoy } from 'lucide-react'

export default function SupportPage() {
  const { profile } = useAppStore()
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
        <p className="text-gray-500 mb-6">
          We&apos;ve received your request and will get back to you as soon as possible.
        </p>
        <Button onClick={() => { setSuccess(false); setForm({ ...form, subject: '', message: '', category: 'general' }) }}>
          Submit Another Case
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display text-gray-900">Raise a Support Case</h1>
        <p className="text-gray-500 text-sm mt-1">
          Having an issue or need help? Let us know and we&apos;ll get back to you.
        </p>
      </div>

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
        </ul>
      </div>
    </div>
  )
}
