'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { DocumentType } from '@/types/database'

interface SharedDoc {
  type: DocumentType
  content: Record<string, unknown>
  createdAt: string
  company: string | null
  role: string | null
  views: number
}

export default function SharedDocumentPage() {
  const params = useParams()
  const token = params.token as string
  const [doc, setDoc] = useState<SharedDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/share?token=${token}`)
        if (!res.ok) {
          setError('This share link is no longer available.')
          setLoading(false)
          return
        }
        const data = await res.json()
        setDoc(data)
      } catch {
        setError('Failed to load document.')
      }
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link Unavailable</h1>
          <p className="text-gray-500 mb-6">{error || 'This document is no longer shared.'}</p>
          <Link href="/">
            <Button variant="default">
              Try Resume Studio Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const content = doc.content as Record<string, unknown>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Resume Studio</span>
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="accent">
              Create Yours Free <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</Badge>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye className="h-3 w-3" /> {doc.views + 1} views
            </span>
          </div>
          {(doc.role || doc.company) && (
            <p className="text-sm text-gray-500">
              {doc.role}{doc.role && doc.company ? ' at ' : ''}{doc.company}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
          {doc.type === 'resume' && <SharedResumeView data={content} />}
          {doc.type === 'cover_letter' && <SharedCoverLetterView data={content} />}
          {doc.type === 'linkedin_summary' && <SharedLinkedInView data={content} />}
          {doc.type !== 'resume' && doc.type !== 'cover_letter' && doc.type !== 'linkedin_summary' && (
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-[family-name:var(--font-body)]">
              {JSON.stringify(content, null, 2)}
            </pre>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-3">
            This document was generated with Resume Studio
          </p>
          <Link href="/signup">
            <Button variant="accent" size="lg">
              Generate Your Own Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-2">
            No credit card required. 2 free documents per month.
          </p>
        </div>
      </div>
    </div>
  )
}

function SharedResumeView({ data }: { data: Record<string, unknown> }) {
  const d = data as { header?: Record<string, string>; summary?: string; experience?: Array<Record<string, unknown>>; skills?: { core?: string[]; tools?: string[] } }
  return (
    <div className="space-y-5 text-sm">
      {d.header && (
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">{d.header.name}</h2>
          <p className="text-brand font-medium">{d.header.title}</p>
        </div>
      )}
      {d.summary && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 uppercase text-xs tracking-wider">Summary</h3>
          <p className="text-gray-700">{d.summary}</p>
        </div>
      )}
      {d.experience && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 uppercase text-xs tracking-wider">Experience</h3>
          {d.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold text-gray-900">{exp.title as string}</p>
              <p className="text-gray-600 text-xs">{exp.company as string}</p>
              <ul className="mt-1 space-y-0.5">
                {(exp.bullets as string[] || []).map((b, j) => (
                  <li key={j} className="text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {d.skills && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 uppercase text-xs tracking-wider">Skills</h3>
          <p className="text-gray-700">{[...(d.skills.core || []), ...(d.skills.tools || [])].join(', ')}</p>
        </div>
      )}
    </div>
  )
}

function SharedCoverLetterView({ data }: { data: Record<string, unknown> }) {
  const d = data as { greeting?: string; opening_paragraph?: string; body_paragraphs?: string[]; closing_paragraph?: string; sign_off?: string }
  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p className="font-medium">{d.greeting},</p>
      <p>{d.opening_paragraph}</p>
      {d.body_paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
      <p>{d.closing_paragraph}</p>
      <p className="font-medium">{d.sign_off}</p>
    </div>
  )
}

function SharedLinkedInView({ data }: { data: Record<string, unknown> }) {
  const d = data as { headline?: string; summary?: string }
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs text-gray-500 mb-1">Headline</p>
        <p className="font-semibold text-gray-900">{d.headline}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">About</p>
        <p className="text-gray-700 whitespace-pre-wrap">{d.summary}</p>
      </div>
    </div>
  )
}
