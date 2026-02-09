'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'
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

export function DocumentPreview() {
  const { generatedDocuments, parsedJD, setStep, isGenerating } = useGenerationStore()
  const [atsLoading, setAtsLoading] = useState(false)
  const [atsScore, setAtsScore] = useState<Record<string, unknown> | null>(null)

  const documentTypes = Object.keys(generatedDocuments) as DocumentType[]

  const handleATSScore = async () => {
    if (!generatedDocuments.resume || !parsedJD) return
    setAtsLoading(true)
    try {
      const res = await fetch('/api/ai/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJSON: generatedDocuments.resume, parsedJD }),
      })
      const data = await res.json()
      if (data.success) setAtsScore(data.data)
    } catch {
      // ignore
    }
    setAtsLoading(false)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-brand mb-4" />
        <h3 className="text-xl font-display text-gray-900 mb-2">Generating your documents...</h3>
        <p className="text-gray-500">This usually takes 15-30 seconds.</p>
      </div>
    )
  }

  if (documentTypes.length === 0) {
    return null
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

      {generatedDocuments.resume && (
        <div className="flex gap-3">
          <Button onClick={handleATSScore} disabled={atsLoading} variant="outline">
            {atsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Check ATS Score
          </Button>
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
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
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
