'use client'

import { useState, useCallback } from 'react'
import { useGenerationStore } from '@/store/generation-store'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/lib/hooks/use-usage'
import { isAnnual } from '@/lib/plan-helpers'
import type { Profile } from '@/types/database'
import { GenerationStepper } from '@/components/generate/generation-stepper'
import { JDInput } from '@/components/generate/jd-input'
import { ExperienceInput } from '@/components/generate/experience-input'
import { DocumentPreview } from '@/components/generate/document-preview'
import { TemplateSelector } from '@/components/generate/template-selector'
import { FontSelector } from '@/components/generate/font-selector'
import { FontSizeSelector } from '@/components/generate/font-size-selector'
import { LanguageSelector } from '@/components/generate/language-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Mail, Linkedin, MessageSquare, BookOpen, Award, Loader2, Sparkles } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { DocumentType } from '@/types/database'

const docOptions: { type: DocumentType; icon: React.ElementType; description: string }[] = [
  { type: 'resume', icon: FileText, description: 'ATS-optimized, tailored to the JD' },
  { type: 'cover_letter', icon: Mail, description: 'Compelling, personalized cover letter' },
  { type: 'linkedin_summary', icon: Linkedin, description: 'Keyword-rich LinkedIn About section' },
  { type: 'cold_email', icon: MessageSquare, description: 'Concise email to hiring managers' },
  { type: 'interview_prep', icon: BookOpen, description: 'Questions, answers, and tips' },
  { type: 'certification_guide', icon: Award, description: 'Certifications roadmap for your target role' },
]

const API_ROUTES: Record<string, string> = {
  resume: '/api/ai/generate-resume',
  cover_letter: '/api/ai/generate-cover-letter',
  linkedin_summary: '/api/ai/generate-linkedin',
  cold_email: '/api/ai/generate-cold-email',
  interview_prep: '/api/ai/generate-interview-prep',
  certification_guide: '/api/ai/generate-certification-guide',
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
    contactInfo,
    setGeneratedDocument,
    setIsGenerating,
    isGenerating,
    setError,
    selectedTemplate,
    setSelectedTemplate,
    selectedFont,
    setSelectedFont,
    selectedFontSize,
    setSelectedFontSize,
    language,
    setLanguage,
    customLanguage,
    setCustomLanguage,
  } = useGenerationStore()
  const { profile, setProfile } = useAppStore()
  const { canGenerate } = useUsage(profile)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const userIsAnnual = isAnnual(profile)

  const refreshProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data as Profile)
    }
  }, [setProfile])

  const handleGenerate = async () => {
    if (!canGenerate) {
      setGenerationError('Free plan limit reached. Upgrade to Pro for unlimited documents.')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setError(null)
    setStep('review')

    // Resolve language for API
    const effectiveLanguage = language === 'custom' ? customLanguage : language

    try {
      const results = await Promise.allSettled(
        selectedDocuments.map(async (type) => {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 120_000) // 2 min timeout
          try {
            const bodyPayload: Record<string, unknown> = {
              parsedJD,
              experience,
              jobDescriptionId,
              contactInfo,
            }
            // Only send language if annual user selected non-English
            if (userIsAnnual && effectiveLanguage && effectiveLanguage !== 'en') {
              bodyPayload.language = effectiveLanguage
            }

            const res = await fetch(API_ROUTES[type], {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyPayload),
              signal: controller.signal,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || `Failed to generate ${type}`)
            setGeneratedDocument(type, data.content)
            return { type, content: data.content }
          } finally {
            clearTimeout(timeout)
          }
        })
      )

      const failures = results
        .map((r, i) => (r.status === 'rejected' ? selectedDocuments[i] : null))
        .filter(Boolean) as DocumentType[]

      if (failures.length === selectedDocuments.length) {
        const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
        const message = firstError?.reason?.message || 'All generations failed'
        setGenerationError(message)
        setError(message)
      } else if (failures.length > 0) {
        const failedNames = failures.map((f) => DOCUMENT_TYPE_LABELS[f]).join(', ')
        setGenerationError(`Some documents failed to generate: ${failedNames}. The rest are ready below.`)
        setError(`Partial failure: ${failedNames}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setGenerationError(message)
      setError(message)
    } finally {
      setIsGenerating(false)
      refreshProfile()
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

          {/* Template, Font, and Size selectors (visible when resume selected) */}
          {selectedDocuments.includes('resume') && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <TemplateSelector
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
                isAnnual={userIsAnnual}
              />
              <div className="grid grid-cols-2 gap-4">
                <FontSelector
                  selected={selectedFont}
                  onSelect={setSelectedFont}
                  isAnnual={userIsAnnual}
                />
                <FontSizeSelector
                  selected={selectedFontSize}
                  onSelect={setSelectedFontSize}
                  isAnnual={userIsAnnual}
                />
              </div>
            </div>
          )}

          {/* Language selector (Pro Annual only) */}
          <LanguageSelector
            selected={language}
            onSelect={setLanguage}
            customLanguage={customLanguage}
            onCustomChange={setCustomLanguage}
            isAnnual={userIsAnnual}
          />

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
