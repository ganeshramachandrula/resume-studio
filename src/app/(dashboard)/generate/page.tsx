'use client'

import { useState } from 'react'
import { useGenerationStore } from '@/store/generation-store'
import { useAppStore } from '@/store/app-store'
import { useUsage } from '@/lib/hooks/use-usage'
import { GenerationStepper } from '@/components/generate/generation-stepper'
import { JDInput } from '@/components/generate/jd-input'
import { ExperienceInput } from '@/components/generate/experience-input'
import { DocumentPreview } from '@/components/generate/document-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Mail, Linkedin, MessageSquare, BookOpen, Loader2, Sparkles } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { DocumentType } from '@/types/database'

const docOptions: { type: DocumentType; icon: React.ElementType; description: string }[] = [
  { type: 'resume', icon: FileText, description: 'ATS-optimized, tailored to the JD' },
  { type: 'cover_letter', icon: Mail, description: 'Compelling, personalized cover letter' },
  { type: 'linkedin_summary', icon: Linkedin, description: 'Keyword-rich LinkedIn About section' },
  { type: 'cold_email', icon: MessageSquare, description: 'Concise email to hiring managers' },
  { type: 'interview_prep', icon: BookOpen, description: 'Questions, answers, and tips' },
]

const API_ROUTES: Record<string, string> = {
  resume: '/api/ai/generate-resume',
  cover_letter: '/api/ai/generate-cover-letter',
  linkedin_summary: '/api/ai/generate-linkedin',
  cold_email: '/api/ai/generate-cold-email',
  interview_prep: '/api/ai/generate-interview-prep',
}

export default function GeneratePage() {
  const {
    step,
    setStep,
    selectedDocuments,
    toggleDocument,
    setSelectedDocuments,
    parsedJD,
    jobDescriptionId,
    experience,
    setGeneratedDocument,
    setIsGenerating,
    isGenerating,
    setError,
  } = useGenerationStore()
  const { profile } = useAppStore()
  const { canGenerate } = useUsage(profile)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!canGenerate) {
      setGenerationError('Free plan limit reached. Upgrade to Pro for unlimited documents.')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setStep('review')

    try {
      const results = await Promise.all(
        selectedDocuments.map(async (type) => {
          const res = await fetch(API_ROUTES[type], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parsedJD,
              experience,
              jobDescriptionId,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || `Failed to generate ${type}`)
          return { type, content: data.content }
        })
      )

      results.forEach(({ type, content }) => {
        setGeneratedDocument(type, content)
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setGenerationError(message)
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GenerationStepper currentStep={step} />

      {step === 'jd_input' && <JDInput />}

      {step === 'experience_input' && <ExperienceInput />}

      {step === 'select_documents' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-display text-gray-900 mb-2">
              Choose Documents to Generate
            </h2>
            <p className="text-gray-500">
              Select which documents to create for this role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docOptions.map(({ type, icon: Icon, description }) => (
              <Card
                key={type}
                className={`cursor-pointer transition-all ${
                  selectedDocuments.includes(type)
                    ? 'border-brand ring-2 ring-brand/20 bg-brand/5'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => toggleDocument(type)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedDocuments.includes(type)
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {DOCUMENT_TYPE_LABELS[type]}
                    </p>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  {selectedDocuments.includes(type) && (
                    <Badge variant="default" className="ml-auto text-xs shrink-0">
                      Selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDocuments(docOptions.map((d) => d.type))}
          >
            Select All
          </Button>

          {generationError && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
              {generationError}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep('experience_input')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={selectedDocuments.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && <DocumentPreview />}
    </div>
  )
}
