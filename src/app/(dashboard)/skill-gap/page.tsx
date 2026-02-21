'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Target, BookOpen, Zap, ArrowLeft, ExternalLink } from 'lucide-react'
import type { SkillGapData } from '@/types/documents'
import type { VaultSkill } from '@/types/database'

const SEVERITY_COLORS: Record<string, string> = {
  none: 'bg-green-100 text-green-800',
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const LEVEL_VALUES: Record<string, number> = {
  none: 0,
  basic: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
}

const PRIORITY_COLORS: Record<string, string> = {
  essential: 'bg-red-100 text-red-800',
  recommended: 'bg-amber-100 text-amber-800',
  optional: 'bg-blue-100 text-blue-800',
}

function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
  const bgColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none" stroke="currentColor"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{score}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Role Readiness</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-2 flex-1 rounded-full ${bgColor}`} style={{ width: `${score}%`, maxWidth: '120px' }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {score >= 80 ? 'Strong fit' : score >= 60 ? 'Good foundation, some gaps' : 'Significant gaps to address'}
        </p>
      </div>
    </div>
  )
}

function SkillBar({ skill, requiredLevel, currentLevel }: { skill: string; requiredLevel: string; currentLevel: string }) {
  const reqVal = LEVEL_VALUES[requiredLevel] || 0
  const curVal = LEVEL_VALUES[currentLevel] || 0
  const reqPct = (reqVal / 4) * 100
  const curPct = (curVal / 4) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{skill}</span>
        <span className="text-xs text-gray-500">{currentLevel} / {requiredLevel}</span>
      </div>
      <div className="relative bg-gray-100 rounded-full h-3">
        <div className="absolute inset-y-0 left-0 bg-brand/30 rounded-full" style={{ width: `${reqPct}%` }} />
        <div className={`absolute inset-y-0 left-0 rounded-full ${curVal >= reqVal ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${curPct}%` }} />
      </div>
    </div>
  )
}

export default function SkillGapPage() {
  const [step, setStep] = useState<'input' | 'results'>('input')
  const [jobDescription, setJobDescription] = useState('')
  const [vaultSkills, setVaultSkills] = useState<VaultSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SkillGapData | null>(null)

  // Load vault skills on mount
  useEffect(() => {
    async function loadSkills() {
      const supabase = createClient()
      const { data } = await supabase.from('vault_skills').select('*').order('name')
      if (data) setVaultSkills(data as VaultSkill[])
      setLoadingSkills(false)
    }
    void loadSkills()
  }, [])

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || vaultSkills.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/skill-gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          skills: vaultSkills.map((s) => ({
            name: s.name,
            proficiency: s.proficiency,
            category: s.category || undefined,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')

      setResult(data.data as SkillGapData)
      setStep('results')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze skills')
    }
    setLoading(false)
  }

  if (step === 'input') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display text-gray-900">Skill Gap Analysis</h1>
          <p className="text-gray-500 mt-1">Compare your skills against a job description to identify gaps and get a learning plan.</p>
        </div>

        {/* Vault skills summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)]">Your Skills (from Credential Vault)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSkills ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading skills...
              </div>
            ) : vaultSkills.length === 0 ? (
              <div className="text-sm text-gray-500">
                <p>No skills found in your vault. Add skills in the <a href="/vault" className="text-brand underline">Credential Vault</a> first.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vaultSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="text-xs">
                    {skill.name} ({skill.proficiency})
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job description input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)]">Target Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-xs text-gray-400">{jobDescription.length}/15,000 characters</p>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">{error}</div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleAnalyze}
            disabled={loading || vaultSkills.length === 0 || jobDescription.length < 50}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Target className="h-4 w-4" /> Analyze Skill Gap</>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Results view
  if (!result) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-gray-900">Skill Gap Analysis</h1>
          <p className="text-gray-500 mt-1">Results for: {result.role_title}</p>
        </div>
        <Button variant="outline" onClick={() => setStep('input')}>
          <ArrowLeft className="h-4 w-4" /> New Analysis
        </Button>
      </div>

      {/* Readiness score */}
      <Card>
        <CardContent className="p-6">
          <ReadinessGauge score={result.overall_readiness} />
          <p className="text-sm text-gray-700 mt-4">{result.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills assessment */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              Skill-by-Skill Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.skills.map((skill, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <SkillBar skill={skill.skill} requiredLevel={skill.required_level} currentLevel={skill.current_level} />
                  <Badge className={`ml-3 shrink-0 ${SEVERITY_COLORS[skill.gap_severity]}`}>
                    {skill.gap_severity === 'none' ? 'Match' : skill.gap_severity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{skill.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick wins */}
        {result.quick_wins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Quick Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.quick_wins.map((win, i) => (
                  <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400">
                    {win}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Learning plan */}
        <Card className={result.quick_wins.length > 0 ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand" />
              Learning Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.learning_plan.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900">{step.resource_name}</p>
                    <Badge className={PRIORITY_COLORS[step.priority]}>{step.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.skill} &middot; {step.resource_type} &middot; ~{step.estimated_hours}h &middot; {step.cost}
                  </p>
                  {step.resource_url && (
                    <a
                      href={step.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Open resource <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
