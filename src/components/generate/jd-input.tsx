'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'
import type { ParsedJD } from '@/types/documents'

export function JDInput() {
  const {
    jobDescription,
    setJobDescription,
    parsedJD,
    setParsedJD,
    setStep,
  } = useGenerationStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (jobDescription.length < 50) {
      setError('Please paste a more detailed job description (at least 50 characters).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse')
      }

      setParsedJD(result.data.parsed_data, result.data.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const parsed = parsedJD as ParsedJD | null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-gray-900 mb-2">
          Paste the Job Description
        </h2>
        <p className="text-gray-500">
          Copy and paste the full job posting. We'll extract key requirements and keywords.
        </p>
      </div>

      <Textarea
        placeholder="Paste the full job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="min-h-[250px]"
      />

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <Button onClick={handleParse} disabled={loading || jobDescription.length < 50}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Parse Job Description
          </>
        )}
      </Button>

      {parsed && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-[family-name:var(--font-body)]">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Parsed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="font-medium text-gray-900">{parsed.role_title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="font-medium text-gray-900">{parsed.company_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Seniority</p>
                <p className="font-medium text-gray-900 capitalize">{parsed.seniority_level}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">
                  {parsed.location || 'Not specified'} ({parsed.remote_policy})
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Key Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.required_skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">ATS Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.keywords_for_ats?.map((kw) => (
                  <Badge key={kw} variant="accent" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep('experience_input')} className="w-full">
              Continue to Experience
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
