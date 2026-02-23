'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_LABELS, MAX_SUPPORT_MESSAGE_LENGTH } from '@/lib/constants'
import { Send, CheckCircle } from 'lucide-react'
import type { LandingTranslation } from '@/lib/i18n/translations'

interface ContactContentProps {
  t: LandingTranslation['contactPage']
}

export function ContactContent({ t }: ContactContentProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general' as string,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [caseNumber, setCaseNumber] = useState('')

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
      <section className="py-24 px-4 min-h-[80vh] flex items-center">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display text-white mb-4">{t.messageSentTitle}</h1>
          {caseNumber && (
            <p className="text-lg font-mono font-semibold text-brand mb-2">
              {caseNumber}
            </p>
          )}
          <p className="text-gray-400">
            {t.messageSentBody}
            {caseNumber && <> {t.caseNumberLabel} <span className="font-mono font-medium text-white">{caseNumber}</span>.</>}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-400">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                {t.nameLabel}
              </label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                {t.emailLabel} <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1.5">
                {t.subjectLabel} <span className="text-red-400">*</span>
              </label>
              <Input
                id="subject"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={t.subjectPlaceholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1.5">
                {t.categoryLabel}
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-md border border-white/10 bg-white/5 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {SUPPORT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">
                    {SUPPORT_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1.5">
              {t.messageLabel} <span className="text-red-400">*</span>
            </label>
            <Textarea
              id="message"
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, MAX_SUPPORT_MESSAGE_LENGTH) })}
              placeholder={t.messagePlaceholder}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.message.length}/{MAX_SUPPORT_MESSAGE_LENGTH}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white"
          >
            {loading ? t.sending : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t.sendMessage}
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
