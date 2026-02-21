'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGenerationStore } from '@/store/generation-store'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/lib/hooks/use-usage'
import { isPro } from '@/lib/plan-helpers'
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
import { ArrowLeft, FileText, Mail, Linkedin, MessageSquare, BookOpen, Award, Loader2, Sparkles, Reply } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import { EXPERIENCE_MAX_CHARS } from '@/lib/security/validation'
import { detectBrowserLanguageCode } from '@/lib/i18n/currencies'
import { PRESET_LANGUAGES } from '@/lib/templates/languages'
import type { DocumentType } from '@/types/database'

const docOptions: { type: DocumentType; icon: React.ElementType; description: string }[] = [
  { type: 'resume', icon: FileText, description: 'ATS-optimized, tailored to the JD' },
  { type: 'cover_letter', icon: Mail, description: 'Compelling, personalized cover letter' },
  { type: 'linkedin_summary', icon: Linkedin, description: 'Keyword-rich LinkedIn About section' },
  { type: 'cold_email', icon: MessageSquare, description: 'Concise email to hiring managers' },
  { type: 'interview_prep', icon: BookOpen, description: 'Questions, answers, and tips' },
  { type: 'certification_guide', icon: Award, description: 'Certifications roadmap for your target role' },
  { type: 'follow_up_email', icon: Reply, description: 'Post-interview thank-you email' },
]

const API_ROUTES: Record<string, string> = {
  resume: '/api/ai/generate-resume',
  cover_letter: '/api/ai/generate-cover-letter',
  linkedin_summary: '/api/ai/generate-linkedin',
  cold_email: '/api/ai/generate-cold-email',
  interview_prep: '/api/ai/generate-interview-prep',
  certification_guide: '/api/ai/generate-certification-guide',
  follow_up_email: '/api/ai/generate-follow-up-email',
}

function GeneratePageInner() {
  const searchParams = useSearchParams()
  const {
    step,
    setStep,
    setJobDescription,
    setParsedJD,
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
  const [interviewNotes, setInterviewNotes] = useState('')
  const userIsPro = isPro(profile)

  // Load JD from database when ?jd_id= is present
  useEffect(() => {
    const jdId = searchParams.get('jd_id')
    if (!jdId) return

    async function loadJD() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('job_descriptions')
          .select('*')
          .eq('id', jdId)
          .single()

        if (error || !data) return

        setJobDescription(data.raw_text)
        setParsedJD(data.parsed_data as Record<string, unknown>, data.id)
        setStep('experience_input')
      } catch {
        // Silently fail — user can still paste manually
      }
    }
    loadJD()
  }, [searchParams, setJobDescription, setParsedJD, setStep])

  // Auto-detect browser language and pre-select for annual users
  useEffect(() => {
    if (userIsPro && language === 'en') {
      const browserLang = detectBrowserLanguageCode()
      if (browserLang !== 'en' && PRESET_LANGUAGES.some((l) => l.code === browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [userIsPro, language, setLanguage])

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
            if (userIsPro && effectiveLanguage && effectiveLanguage !== 'en') {
              bodyPayload.language = effectiveLanguage
            }
            // Include interview notes for follow-up email
            if (type === 'follow_up_email' && interviewNotes) {
              bodyPayload.interviewNotes = interviewNotes
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

          {/* Interview notes for follow-up email */}
          {selectedDocuments.includes('follow_up_email') && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <label htmlFor="interview-notes" className="block text-sm font-medium text-gray-700">
                Interview Notes <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">
                Describe what was discussed, the interviewer&apos;s name, key topics, and anything you want to reference in your follow-up.
              </p>
              <textarea
                id="interview-notes"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="e.g., Spoke with Sarah Chen (VP Marketing) about their Q3 brand refresh initiative. Discussed my experience with rebranding at Crestline..."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                maxLength={5000}
              />
              <p className="text-xs text-gray-400 text-right">{interviewNotes.length}/5,000</p>
            </div>
          )}

          {/* Template, Font, and Size selectors (visible when resume selected) */}
          {selectedDocuments.includes('resume') && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <TemplateSelector
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
                isPro={userIsPro}
              />
              <div className="grid grid-cols-2 gap-4">
                <FontSelector
                  selected={selectedFont}
                  onSelect={setSelectedFont}
                  isPro={userIsPro}
                />
                <FontSizeSelector
                  selected={selectedFontSize}
                  onSelect={setSelectedFontSize}
                  isPro={userIsPro}
                />
              </div>
            </div>
          )}

          {/* Language selector (Pro only) */}
          <LanguageSelector
            selected={language}
            onSelect={setLanguage}
            customLanguage={customLanguage}
            onCustomChange={setCustomLanguage}
            isPro={userIsPro}
          />

          {experience.length > EXPERIENCE_MAX_CHARS && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
              Your experience text exceeds the {EXPERIENCE_MAX_CHARS.toLocaleString()} character limit. Go back and shorten it to generate documents.
            </div>
          )}

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
              disabled={selectedDocuments.length === 0 || isGenerating || experience.length > EXPERIENCE_MAX_CHARS || (selectedDocuments.includes('follow_up_email') && interviewNotes.length < 10)}
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

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>}>
      <GeneratePageInner />
    </Suspense>
  )
}
