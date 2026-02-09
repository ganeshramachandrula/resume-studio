'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArrowLeft, Download, Copy, Check, Loader2, Info, HelpCircle } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'
import { useAppStore } from '@/store/app-store'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { DocumentType } from '@/types/database'
import type {
  ResumeData,
  CoverLetterData,
  LinkedInData,
  ColdEmailData,
  InterviewPrepData,
} from '@/types/documents'
import { ATSScoreDisplay } from './ats-score-display'
import { PDFGenerator } from '@/components/pdf/pdf-generator'

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-6 text-sm">
      <div className="text-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{data.header.name}</h2>
        <p className="text-brand font-medium">{data.header.title}</p>
        <p className="text-gray-500 text-xs mt-1">
          {[data.header.email, data.header.phone, data.header.location].filter(Boolean).join(' | ')}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1 uppercase text-xs tracking-wider">Summary</h3>
        <p className="text-gray-700">{data.summary}</p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2 uppercase text-xs tracking-wider">Experience</h3>
        {data.experience?.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold text-gray-900">{exp.title}</p>
              <p className="text-xs text-gray-500">{exp.start_date} — {exp.end_date}</p>
            </div>
            <p className="text-gray-600 text-xs">{exp.company} | {exp.location}</p>
            <ul className="mt-1.5 space-y-1">
              {exp.bullets?.map((b, j) => (
                <li key={j} className="text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brand">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2 uppercase text-xs tracking-wider">Skills</h3>
        <div className="flex flex-wrap gap-1.5">
          {[...(data.skills?.technical || []), ...(data.skills?.tools || [])].map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function CoverLetterPreview({ data }: { data: CoverLetterData }) {
  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p className="font-medium">{data.greeting},</p>
      <p>{data.opening_paragraph}</p>
      {data.body_paragraphs?.map((p, i) => <p key={i}>{p}</p>)}
      <p>{data.closing_paragraph}</p>
      <p className="font-medium">{data.sign_off}</p>
    </div>
  )
}

function LinkedInPreview({ data }: { data: LinkedInData }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs text-gray-500 mb-1">Headline</p>
        <p className="font-semibold text-gray-900">{data.headline}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">About</p>
        <p className="text-gray-700 whitespace-pre-wrap">{data.summary}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Suggested Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {data.suggested_skills?.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
        </div>
      </div>
    </div>
  )
}

function ColdEmailPreview({ data }: { data: ColdEmailData }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs text-gray-500 mb-1">Subject</p>
        <p className="font-semibold text-gray-900">{data.subject_line}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Body</p>
        <p className="text-gray-700 whitespace-pre-wrap">{data.body}</p>
      </div>
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-1">Follow-up (if no reply in 5 days)</p>
        <p className="font-medium text-gray-900 text-xs mb-1">Subject: {data.follow_up_subject}</p>
        <p className="text-gray-700 whitespace-pre-wrap">{data.follow_up_body}</p>
      </div>
    </div>
  )
}

function InterviewPrepPreview({ data }: { data: InterviewPrepData }) {
  return (
    <div className="space-y-6 text-sm">
      {[
        { title: 'Behavioral Questions', items: data.behavioral_questions },
        { title: 'Technical Questions', items: data.technical_questions },
        { title: 'Situational Questions', items: data.situational_questions },
      ].map((section) => (
        <div key={section.title}>
          <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
          <div className="space-y-4">
            {section.items?.map((q, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50">
                <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                <p className="text-xs text-gray-500 mb-2">Why asked: {q.why_asked}</p>
                <p className="text-gray-700 mb-1">{q.model_answer}</p>
                <p className="text-xs text-accent">Tip: {q.tips}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Questions to Ask</h3>
        {data.questions_to_ask?.map((q, i) => (
          <div key={i} className="mb-2">
            <p className="text-gray-900">{q.question}</p>
            <p className="text-xs text-gray-500">{q.why_impressive}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const FREE_WATERMARK_TEXT = '\n\n---\nGenerated with Resume Studio - Free Preview\nUpgrade to Pro to save and organize your documents.'

function documentToText(type: DocumentType, content: Record<string, unknown>, isFree: boolean): string {
  let text = ''
  if (type === 'cover_letter') {
    const d = content as unknown as CoverLetterData
    text = [d.greeting + ',', '', d.opening_paragraph, ...(d.body_paragraphs || []), d.closing_paragraph, '', d.sign_off].join('\n\n')
  } else if (type === 'linkedin_summary') {
    const d = content as unknown as LinkedInData
    text = `Headline: ${d.headline}\n\n${d.summary}\n\nSkills: ${d.suggested_skills?.join(', ')}`
  } else if (type === 'cold_email') {
    const d = content as unknown as ColdEmailData
    text = `Subject: ${d.subject_line}\n\n${d.body}\n\n---\nFollow-up Subject: ${d.follow_up_subject}\n\n${d.follow_up_body}`
  } else if (type === 'interview_prep') {
    const d = content as unknown as InterviewPrepData
    const sections = [
      { title: 'Behavioral Questions', items: d.behavioral_questions },
      { title: 'Technical Questions', items: d.technical_questions },
      { title: 'Situational Questions', items: d.situational_questions },
    ]
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
  } else {
    text = JSON.stringify(content, null, 2)
  }

  if (isFree) {
    text += FREE_WATERMARK_TEXT
  }

  return text
}

function CopyButton({ type, content, isFree }: { type: DocumentType; content: Record<string, unknown>; isFree: boolean }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const text = documentToText(type, content, isFree)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button size="sm" variant="outline" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy Text'}
    </Button>
  )
}

function DownloadTextButton({ type, content, isFree }: { type: DocumentType; content: Record<string, unknown>; isFree: boolean }) {
  const handleDownload = () => {
    const text = documentToText(type, content, isFree)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${DOCUMENT_TYPE_LABELS[type].replace(/\s+/g, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Button size="sm" variant="outline" onClick={handleDownload}>
      <Download className="h-4 w-4" /> Download
    </Button>
  )
}

export function DocumentPreview() {
  const { generatedDocuments, parsedJD, setStep, isGenerating, error } = useGenerationStore()
  const { profile } = useAppStore()
  const [atsLoading, setAtsLoading] = useState(false)
  const [atsScore, setAtsScore] = useState<Record<string, unknown> | null>(null)
  const [atsError, setAtsError] = useState<string | null>(null)

  const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual'
  const isFree = !isPro

  const documentTypes = Object.keys(generatedDocuments) as DocumentType[]

  const handleATSScore = async () => {
    if (!generatedDocuments.resume || !parsedJD) return
    setAtsLoading(true)
    setAtsError(null)
    try {
      const res = await fetch('/api/ai/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJSON: generatedDocuments.resume, parsedJD }),
      })
      const data = await res.json()
      if (data.success) {
        setAtsScore(data.data)
      } else {
        setAtsError(data.error || 'Failed to calculate ATS score')
      }
    } catch {
      setAtsError('Failed to connect. Please try again.')
    }
    setAtsLoading(false)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-brand mb-4" />
        <h3 className="text-xl font-display text-gray-900 mb-2">Generating your documents...</h3>
        <p className="text-gray-500">This may take up to 2 minutes for large document sets.</p>
      </div>
    )
  }

  if (documentTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 mb-4 max-w-md text-center">
          {error || 'Generation failed. Please try again.'}
        </div>
        <Button variant="outline" onClick={() => setStep('select_documents')}>
          <ArrowLeft className="h-4 w-4" /> Back to Document Selection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-gray-900 mb-2">Review & Download</h2>
          <p className="text-gray-500">Your documents are ready. Review and download.</p>
        </div>
        <Button variant="outline" onClick={() => setStep('select_documents')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {isFree && (
        <div className="flex items-start gap-3 bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-200">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Preview mode</p>
            <p className="text-blue-700 mt-0.5">
              Documents are not saved. Downloads include a watermark. Upgrade to Pro to save and organize your documents.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-xl border border-amber-200">
          {error}
        </div>
      )}

      {generatedDocuments.resume && !atsScore && (
        <div className="flex items-center gap-3">
          <Button onClick={handleATSScore} disabled={atsLoading} variant="outline">
            {atsLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing resume...
              </>
            ) : (
              'Check ATS Score'
            )}
          </Button>
          <span className="relative group">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 text-xs text-white bg-gray-900 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              ATS (Applicant Tracking System) is software used by employers to filter resumes. This checks how well your resume matches the job description.
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </span>
          </span>
          {atsError && (
            <span className="text-sm text-red-600">{atsError}</span>
          )}
        </div>
      )}

      {atsScore && <ATSScoreDisplay data={atsScore} />}

      <Tabs defaultValue={documentTypes[0]}>
        <TabsList>
          {documentTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {DOCUMENT_TYPE_LABELS[type]}
            </TabsTrigger>
          ))}
        </TabsList>
        {documentTypes.map((type) => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-[family-name:var(--font-body)]">{DOCUMENT_TYPE_LABELS[type]}</CardTitle>
                <div className="flex gap-2">
                  {type === 'resume' ? (
                    <PDFGenerator
                      data={generatedDocuments[type] as unknown as ResumeData}
                      fileName={`resume_${parsedJD?.company_name || 'document'}.pdf`.replace(/\s+/g, '_').toLowerCase()}
                      showWatermark={isFree}
                    />
                  ) : (
                    <DownloadTextButton type={type} content={generatedDocuments[type]} isFree={isFree} />
                  )}
                  <CopyButton type={type} content={generatedDocuments[type]} isFree={isFree} />
                </div>
              </CardHeader>
              <CardContent>
                {type === 'resume' && <ResumePreview data={generatedDocuments[type] as unknown as ResumeData} />}
                {type === 'cover_letter' && <CoverLetterPreview data={generatedDocuments[type] as unknown as CoverLetterData} />}
                {type === 'linkedin_summary' && <LinkedInPreview data={generatedDocuments[type] as unknown as LinkedInData} />}
                {type === 'cold_email' && <ColdEmailPreview data={generatedDocuments[type] as unknown as ColdEmailData} />}
                {type === 'interview_prep' && <InterviewPrepPreview data={generatedDocuments[type] as unknown as InterviewPrepData} />}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
