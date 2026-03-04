'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Star } from 'lucide-react'
import type { JobApplication } from '@/types/database'

const RATABLE_STATUSES = new Set(['rejected', 'offer', 'withdrawn'])

export function JobCard({
  job,
  onClick,
  onRate,
}: {
  job: JobApplication
  onClick: () => void
  onRate?: (job: JobApplication) => void
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <p className="font-medium text-gray-900 text-sm mb-0.5">{job.role}</p>
        <p className="text-xs text-gray-500 mb-2">{job.company}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {new Date(job.created_at).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-1.5">
            {onRate && RATABLE_STATUSES.has(job.status) && (
              <button
                onClick={(e) => { e.stopPropagation(); onRate(job) }}
                className="text-amber-400 hover:text-amber-500"
                title="Rate this company"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
            )}
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-brand hover:text-brand-dark"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
