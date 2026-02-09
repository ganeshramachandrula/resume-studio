'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { ATSScoreData } from '@/types/documents'

export function ATSScoreDisplay({ data }: { data: Record<string, unknown> }) {
  const ats = data as unknown as ATSScoreData

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-[family-name:var(--font-body)]">
          <span>ATS Score</span>
          <span className="text-3xl font-bold text-accent">{ats.overall_score}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">{ats.summary}</p>

        {/* Keyword Match */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Keyword Match</p>
            <span className="text-sm text-gray-500">{ats.keyword_match?.score}%</span>
          </div>
          <Progress value={ats.keyword_match?.score || 0} />
          <div className="mt-2 flex flex-wrap gap-1">
            {ats.keyword_match?.matched?.map((kw) => (
              <Badge key={kw} variant="accent" className="text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" /> {kw}
              </Badge>
            ))}
            {ats.keyword_match?.missing?.map((kw) => (
              <Badge key={kw} variant="destructive" className="text-xs gap-1">
                <XCircle className="h-3 w-3" /> {kw}
              </Badge>
            ))}
          </div>
        </div>

        {/* Skills Coverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Skills Coverage</p>
            <span className="text-sm text-gray-500">{ats.skills_coverage?.score}%</span>
          </div>
          <Progress value={ats.skills_coverage?.score || 0} />
        </div>

        {/* Impact Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Impact Score</p>
            <span className="text-sm text-gray-500">{ats.impact_score?.score}%</span>
          </div>
          <Progress value={ats.impact_score?.score || 0} />
          {ats.impact_score?.suggestions?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {ats.impact_score.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-gray-500">• {s}</li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
