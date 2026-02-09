'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ExternalLink } from 'lucide-react'
import type { JobApplication } from '@/types/database'

export function JobCard({
  job,
  onClick,
}: {
  job: JobApplication
  onClick: () => void
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
      </CardContent>
    </Card>
  )
}
