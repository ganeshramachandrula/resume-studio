'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Trash2, FileText, Copy, Download, Check, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { Document, DocumentType } from '@/types/database'
import type {
  CoverLetterData,
  LinkedInData,
  ColdEmailData,
  InterviewPrepData,
  ResumeData,
} from '@/types/documents'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface ApplicationBundle {
  jobDescriptionId: string
  companyName: string
  roleTitle: string
  createdAt: string
  documents: Document[]
}

function documentToText(type: DocumentType, content: Record<string, unknown>): string {
  if (type === 'cover_letter') {
    const d = content as unknown as CoverLetterData
    return [d.greeting + ',', '', d.opening_paragraph, ...(d.body_paragraphs || []), d.closing_paragraph, '', d.sign_off].join('\n\n')
  }
  if (type === 'linkedin_summary') {
    const d = content as unknown as LinkedInData
    return `Headline: ${d.headline}\n\n${d.summary}\n\nSkills: ${d.suggested_skills?.join(', ')}`
  }
  if (type === 'cold_email') {
    const d = content as unknown as ColdEmailData
    return `Subject: ${d.subject_line}\n\n${d.body}\n\n---\nFollow-up Subject: ${d.follow_up_subject}\n\n${d.follow_up_body}`
  }
  if (type === 'interview_prep') {
    const d = content as unknown as InterviewPrepData
    const sections = [
      { title: 'Behavioral Questions', items: d.behavioral_questions },
      { title: 'Technical Questions', items: d.technical_questions },
      { title: 'Situational Questions', items: d.situational_questions },
    ]
    let text = ''
    for (const s of sections) {
      text += `## ${s.title}\n\n`
      for (const q of s.items || []) {
        text += `Q: ${q.question}\nWhy: ${q.why_asked}\nAnswer: ${q.model_answer}\nTip: ${q.tips}\n\n`
      }
    }
    if (d.questions_to_ask) {
      text += '## Questions to Ask\n\n'
      for (const q of d.questions_to_ask) text += `- ${q.question} (${q.why_impressive})\n`
    }
    return text
  }
  return JSON.stringify(content, null, 2)
}

function DocCopyButton({ doc }: { doc: Document }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const text = documentToText(doc.type, doc.content)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy} title="Copy text">
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4 text-gray-500" />}
    </Button>
  )
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

function DocDownloadButton({ doc }: { doc: Document }) {
  const [loading, setLoading] = useState(false)
  const fileBase = doc.title.replace(/\s+/g, '_').toLowerCase()

  const handleText = () => {
    const text = documentToText(doc.type, doc.content)
    downloadBlob(new Blob([text], { type: 'text/plain' }), `${fileBase}.txt`)
  }

  const handleDocx = async () => {
    setLoading(true)
    try {
      if (doc.type === 'resume') {
        const { resumeToDocxBlob } = await import('@/lib/docx')
        const blob = await resumeToDocxBlob(doc.content as unknown as ResumeData, false)
        downloadBlob(blob, `${fileBase}.docx`)
      } else {
        const { documentToDocxBlob } = await import('@/lib/docx')
        const blob = await documentToDocxBlob(doc.type, doc.content, false)
        downloadBlob(blob, `${fileBase}.docx`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8" title="Download" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <Download className="h-4 w-4 text-gray-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleText}>
          <Download className="h-4 w-4" /> Plain Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDocx}>
          <FileText className="h-4 w-4" /> Word Document (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ApplicationBundleCard({
  bundle,
  onDelete,
  isDeleting,
}: {
  bundle: ApplicationBundle
  onDelete: (jobDescriptionId: string) => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header row */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {bundle.roleTitle || 'Untitled Role'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {bundle.companyName || 'Unknown Company'} &middot; {new Date(bundle.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {bundle.documents.length} {bundle.documents.length === 1 ? 'doc' : 'docs'}
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 pb-4">
            <div className="space-y-2 mt-3">
              {bundle.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </Badge>
                    <span className="text-sm text-gray-700 truncate">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Link href={`/documents/${doc.id}/edit`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit with AI">
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                    </Link>
                    <DocCopyButton doc={doc} />
                    <DocDownloadButton doc={doc} />
                  </div>
                </div>
              ))}
            </div>

            {/* Delete button */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-red-600">Delete this application and all its documents?</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(bundle.jobDescriptionId)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" /> Delete Application
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
