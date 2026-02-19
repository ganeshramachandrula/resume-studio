'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/lib/hooks/use-usage'
import { isAnnual } from '@/lib/plan-helpers'
import { COUNTRIES } from '@/lib/job-feed/countries'
import { getCountryFormat, type CountryResumeFormat } from '@/lib/resume-formats'
import type { Profile, VaultCertificate, VaultSkill } from '@/types/database'
import type { CountryResumeData } from '@/types/documents'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2,
  Sparkles,
  FileText,
  Mail,
  Globe,
  Target,
  MessageSquare,
  Camera,
  Calendar,
  Flag,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

type Step = 'country_job' | 'profile' | 'results'

const STEP_LABELS: Record<Step, string> = {
  country_job: 'Country & Job',
  profile: 'Your Profile',
  results: 'Results',
}

const STEPS: Step[] = ['country_job', 'profile', 'results']

type ResultTab = 'resume' | 'cover_letter' | 'cultural_tips' | 'ats_score' | 'interview_tips'

function CountryResumeInner() {
  const searchParams = useSearchParams()
  const { profile, setProfile } = useAppStore()
  const { canGenerate } = useUsage(profile)
  const userIsAnnual = isAnnual(profile)

  // Step state
  const [step, setStep] = useState<Step>('country_job')

  // Step 1 state
  const [countryCode, setCountryCode] = useState('')
  const [countryFormat, setCountryFormat] = useState<CountryResumeFormat | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [parsedJD, setParsedJD] = useState<Record<string, unknown> | null>(null)
  const [jobDescriptionId, setJobDescriptionId] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Step 2 state
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactLocation, setContactLocation] = useState('')
  const [contactLinkedin, setContactLinkedin] = useState('')
  const [experience, setExperience] = useState('')
  const [vaultCerts, setVaultCerts] = useState<{ name: string; issuer: string; selected: boolean }[]>([])
  const [vaultSkills, setVaultSkills] = useState<{ name: string; proficiency: string; selected: boolean }[]>([])
  const [language, setLanguage] = useState('')

  // Step 3 state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [resultData, setResultData] = useState<CountryResumeData | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('resume')

  // Auto-populate contact info from profile
  useEffect(() => {
    if (profile) {
      setContactName(profile.full_name || '')
      setContactEmail(profile.email || '')
    }
  }, [profile])

  // Load JD from DB when ?jd_id= is present
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
        setParsedJD(data.parsed_data as Record<string, unknown>)
        setJobDescriptionId(data.id)
      } catch {
        // Silently fail
      }
    }
    loadJD()
  }, [searchParams])

  // Fetch vault data when stepping to profile
  useEffect(() => {
    if (step !== 'profile') return

    async function fetchVault() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [certsRes, skillsRes] = await Promise.all([
        supabase.from('vault_certificates').select('name, issuer').eq('user_id', user.id),
        supabase.from('vault_skills').select('name, proficiency').eq('user_id', user.id),
      ])

      if (certsRes.data) {
        setVaultCerts(certsRes.data.map((c: Pick<VaultCertificate, 'name' | 'issuer'>) => ({
          name: c.name,
          issuer: c.issuer,
          selected: true,
        })))
      }
      if (skillsRes.data) {
        setVaultSkills(skillsRes.data.map((s: Pick<VaultSkill, 'name' | 'proficiency'>) => ({
          name: s.name,
          proficiency: s.proficiency,
          selected: true,
        })))
      }
    }
    fetchVault()
  }, [step])

  // Update country format when country changes
  useEffect(() => {
    if (countryCode) {
      const fmt = getCountryFormat(countryCode)
      setCountryFormat(fmt || null)
      if (fmt && userIsAnnual) {
        setLanguage(fmt.norms.language)
      }
    } else {
      setCountryFormat(null)
      setLanguage('')
    }
  }, [countryCode, userIsAnnual])

  const handleParseJD = async () => {
    if (jobDescription.length < 50) {
      setParseError('Job description must be at least 50 characters.')
      return
    }
    setIsParsing(true)
    setParseError(null)
    try {
      const res = await fetch('/api/ai/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to parse job description')
      setParsedJD(data.parsed)
      setJobDescriptionId(data.id)
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Parse failed')
    } finally {
      setIsParsing(false)
    }
  }

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
    if (!parsedJD || !jobDescriptionId || !countryCode) return

    setIsGenerating(true)
    setGenerationError(null)
    setStep('results')

    try {
      const bodyPayload: Record<string, unknown> = {
        parsedJD,
        experience,
        jobDescriptionId,
        countryCode,
        contactInfo: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          location: contactLocation,
          linkedin: contactLinkedin,
        },
      }

      // Language (annual/team only)
      if (userIsAnnual && language && language !== 'English') {
        bodyPayload.language = language
      }

      // Vault data
      const selectedCerts = vaultCerts.filter((c) => c.selected).map(({ name, issuer }) => ({ name, issuer }))
      const selectedSkills = vaultSkills.filter((s) => s.selected).map(({ name, proficiency }) => ({ name, proficiency }))
      if (selectedCerts.length > 0 || selectedSkills.length > 0) {
        bodyPayload.vaultData = {
          certificates: selectedCerts.length > 0 ? selectedCerts : undefined,
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        }
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 180_000)
      try {
        const res = await fetch('/api/ai/generate-country-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Generation failed')
        setResultData(data.content as CountryResumeData)
      } finally {
        clearTimeout(timeout)
      }
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
      refreshProfile()
    }
  }

  // ── Stepper ──
  const renderStepper = () => (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const isActive = s === step
        const isDone = STEPS.indexOf(step) > i
        return (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-px ${isDone ? 'bg-brand' : 'bg-gray-200'}`} />}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand'
                  : isDone
                    ? 'bg-accent/10 text-accent'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-current/10">
                {i + 1}
              </span>
              {STEP_LABELS[s]}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Format preview card ──
  const renderFormatPreview = () => {
    if (!countryFormat) return null
    const n = countryFormat.norms
    return (
      <Card className="border-brand/20 bg-brand/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" />
            <span className="font-semibold text-gray-900">{countryFormat.name} Resume Norms</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Photo:</span>
              <Badge variant={n.photo === 'required' ? 'default' : n.photo === 'discouraged' ? 'destructive' : 'secondary'} className="text-xs">
                {n.photo}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Format:</span>
              <Badge variant="secondary" className="text-xs">{n.preferred_format.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Pages:</span>
              <Badge variant="secondary" className="text-xs">{n.page_limit ?? 'No limit'}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">DOB:</span>
              <Badge variant={n.date_of_birth ? 'default' : 'secondary'} className="text-xs">
                {n.date_of_birth ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Nationality:</span>
              <Badge variant={n.nationality ? 'default' : 'secondary'} className="text-xs">
                {n.nationality ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Language:</span>
              <Badge variant="secondary" className="text-xs">{n.language}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Step 1: Country & Job ──
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-gray-900 mb-2">Country & Job Description</h2>
        <p className="text-gray-500">Select the target country and paste the job description.</p>
      </div>

      {/* Country selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Country</label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="">Select a country...</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {renderFormatPreview()}

      {/* JD input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand resize-y"
        />
        {parseError && (
          <p className="text-red-600 text-sm mt-1">{parseError}</p>
        )}
      </div>

      {parsedJD ? (
        <div className="flex items-center gap-2 text-sm text-accent">
          <CheckCircle2 className="h-4 w-4" />
          Job description parsed: <span className="font-medium">{(parsedJD as Record<string, unknown>).role_title as string || 'Role'}</span> at <span className="font-medium">{(parsedJD as Record<string, unknown>).company_name as string || 'Company'}</span>
        </div>
      ) : (
        <Button onClick={handleParseJD} disabled={isParsing || jobDescription.length < 50}>
          {isParsing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Parsing...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Parse Job Description</>
          )}
        </Button>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setStep('profile')}
          disabled={!parsedJD || !countryCode}
        >
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // ── Step 2: Profile ──
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-gray-900 mb-2">Your Profile</h2>
        <p className="text-gray-500">Enter your details and experience for this application.</p>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={contactLocation}
            onChange={(e) => setContactLocation(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="text"
            value={contactLinkedin}
            onChange={(e) => setContactLinkedin(e.target.value)}
            placeholder="linkedin.com/in/yourprofile"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Paste your work experience, achievements, and background here..."
          rows={8}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">{experience.length}/20,000 characters</p>
      </div>

      {/* Vault credentials */}
      {(vaultCerts.length > 0 || vaultSkills.length > 0) && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Vault Credentials</h3>
          {vaultCerts.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Certificates (uncheck to exclude)</p>
              <div className="flex flex-wrap gap-2">
                {vaultCerts.map((c, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={c.selected}
                      onChange={() => {
                        const updated = [...vaultCerts]
                        updated[i] = { ...updated[i], selected: !updated[i].selected }
                        setVaultCerts(updated)
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{c.name}</span>
                    <span className="text-gray-400">({c.issuer})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {vaultSkills.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Skills (uncheck to exclude)</p>
              <div className="flex flex-wrap gap-2">
                {vaultSkills.map((s, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.selected}
                      onChange={() => {
                        const updated = [...vaultSkills]
                        updated[i] = { ...updated[i], selected: !updated[i].selected }
                        setVaultSkills(updated)
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{s.name}</span>
                    <Badge variant="secondary" className="text-xs">{s.proficiency}</Badge>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Language selector (annual/team only) */}
      {userIsAnnual && countryFormat && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Output Language</label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder={countryFormat.norms.language}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <p className="text-xs text-gray-400 mt-1">
            Auto-set to {countryFormat.norms.language}. Change if needed.
          </p>
        </div>
      )}

      {generationError && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {generationError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep('country_job')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || experience.length < 10}
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate Country Resume</>
          )}
        </Button>
      </div>
    </div>
  )

  // ── Step 3: Results ──
  const resultTabs: { key: ResultTab; label: string; icon: React.ElementType }[] = [
    { key: 'resume', label: 'Resume', icon: FileText },
    { key: 'cover_letter', label: 'Cover Letter', icon: Mail },
    { key: 'cultural_tips', label: 'Cultural Tips', icon: Globe },
    { key: 'ats_score', label: 'ATS Score', icon: Target },
    { key: 'interview_tips', label: 'Interview Tips', icon: MessageSquare },
  ]

  const renderResumeTab = () => {
    if (!resultData) return null
    const r = resultData.resume
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-display text-gray-900">{r.header.name}</h3>
          <p className="text-brand font-medium">{r.header.title}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {r.header.email && <span>{r.header.email}</span>}
            {r.header.phone && <span>{r.header.phone}</span>}
            {r.header.location && <span>{r.header.location}</span>}
            {r.header.linkedin && <span>{r.header.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Summary</h4>
          <p className="text-sm text-gray-600">{r.summary}</p>
        </div>

        {/* Experience */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Experience</h4>
          {r.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{exp.title}</p>
                <span className="text-xs text-gray-400">{exp.start_date} — {exp.end_date}</span>
              </div>
              <p className="text-sm text-gray-500">{exp.company} | {exp.location}</p>
              <ul className="list-disc list-inside mt-1 text-sm text-gray-600 space-y-0.5">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {[...r.skills.core, ...r.skills.interpersonal, ...r.skills.tools].map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Education</h4>
          {r.education.map((edu, i) => (
            <div key={i} className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{edu.degree} in {edu.field}</span> — {edu.institution} ({edu.graduation_date})
              {edu.honors && <span className="text-gray-400"> | {edu.honors}</span>}
            </div>
          ))}
        </div>

        {/* Certifications */}
        {r.certifications.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Certifications</h4>
            <div className="flex flex-wrap gap-1.5">
              {r.certifications.map((c, i) => (
                <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* ATS Keywords */}
        {r.ats_keywords_used.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">ATS Keywords Used</h4>
            <div className="flex flex-wrap gap-1.5">
              {r.ats_keywords_used.map((k, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-brand/5 text-brand">{k}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCoverLetterTab = () => {
    if (!resultData) return null
    const cl = resultData.cover_letter
    return (
      <div className="space-y-4 text-sm text-gray-700 max-w-2xl">
        <p className="font-medium">{cl.greeting}</p>
        <p>{cl.opening_paragraph}</p>
        {cl.body_paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p>{cl.closing_paragraph}</p>
        <p className="whitespace-pre-line">{cl.sign_off}</p>
      </div>
    )
  }

  const renderCulturalTipsTab = () => {
    if (!resultData) return null
    const ct = resultData.cultural_tips
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Work Culture</h4>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {ct.work_culture.map((tip, i) => <li key={i} className="flex items-start gap-2"><span className="text-brand mt-0.5">•</span>{tip}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Communication Style</h4>
            <p className="text-sm text-gray-600">{ct.communication_style}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Business Etiquette</h4>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {ct.business_etiquette.map((tip, i) => <li key={i} className="flex items-start gap-2"><span className="text-brand mt-0.5">•</span>{tip}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Common Mistakes to Avoid</h4>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {ct.common_mistakes.map((tip, i) => <li key={i} className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />{tip}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderATSTab = () => {
    if (!resultData) return null
    const ats = resultData.ats_analysis
    const scoreColor = ats.overall_score >= 80 ? 'text-accent' : ats.overall_score >= 60 ? 'text-yellow-500' : 'text-red-500'
    return (
      <div className="space-y-6">
        {/* Score badge */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${scoreColor}`}>{ats.overall_score}</div>
          <div>
            <p className="font-semibold text-gray-900">ATS Compatibility Score</p>
            <p className="text-sm text-gray-500">Based on keyword match and format compliance</p>
          </div>
        </div>

        {/* Keywords */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Keyword Match</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Matched ({ats.keyword_match.matched.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {ats.keyword_match.matched.map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-accent/10 text-accent">
                      <CheckCircle2 className="h-3 w-3 mr-1" />{k}
                    </Badge>
                  ))}
                </div>
              </div>
              {ats.keyword_match.missing.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Missing ({ats.keyword_match.missing.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats.keyword_match.missing.map((k, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-red-50 text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />{k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Country notes */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Country-Specific Notes</h4>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {ats.country_notes.map((note, i) => <li key={i} className="flex items-start gap-2"><span className="text-brand mt-0.5">•</span>{note}</li>)}
            </ul>
          </CardContent>
        </Card>

        {/* Format compliance */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Format Compliance</h4>
            <p className="text-sm text-gray-600">{ats.format_compliance}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderInterviewTipsTab = () => {
    if (!resultData) return null
    const tips = resultData.interview_tips
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Typical Interview Process</h4>
            <p className="text-sm text-gray-600">{tips.typical_process}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Dress Code</h4>
              <p className="text-sm text-gray-600">{tips.dress_code}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Salary Discussion</h4>
              <p className="text-sm text-gray-600">{tips.salary_discussion}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Follow-Up Etiquette</h4>
            <p className="text-sm text-gray-600">{tips.follow_up}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Common Interview Questions</h4>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              {tips.common_questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-gray-900 mb-1">
            {countryFormat ? `${countryFormat.name} Resume Package` : 'Results'}
          </h2>
          <p className="text-gray-500 text-sm">
            {countryFormat ? `Adapted for ${countryFormat.name} hiring norms` : 'Your generated documents'}
          </p>
        </div>
        {!isGenerating && resultData && (
          <Button variant="outline" size="sm" onClick={() => setStep('profile')}>
            <ArrowLeft className="h-4 w-4" /> Edit & Regenerate
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <div className="text-center">
            <p className="font-medium text-gray-900">Generating your country-specific resume package...</p>
            <p className="text-sm text-gray-500 mt-1">This includes resume, cover letter, cultural tips, ATS analysis, and interview tips.</p>
          </div>
        </div>
      )}

      {generationError && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {generationError}
        </div>
      )}

      {resultData && !isGenerating && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
            {resultTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-white text-brand shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'resume' && renderResumeTab()}
            {activeTab === 'cover_letter' && renderCoverLetterTab()}
            {activeTab === 'cultural_tips' && renderCulturalTipsTab()}
            {activeTab === 'ats_score' && renderATSTab()}
            {activeTab === 'interview_tips' && renderInterviewTipsTab()}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepper()}
      {step === 'country_job' && renderStep1()}
      {step === 'profile' && renderStep2()}
      {step === 'results' && renderStep3()}
    </div>
  )
}

export default function CountryResumePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>}>
      <CountryResumeInner />
    </Suspense>
  )
}
