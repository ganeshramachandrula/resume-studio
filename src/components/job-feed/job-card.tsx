'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, ExternalLink, Sparkles, Wifi, X } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'
import { JOB_PROVIDER_LABELS } from '@/lib/constants'
import type { ScoredJob } from '@/lib/job-feed/relevance'

interface JobCardProps {
  job: ScoredJob
  onDismiss?: (id: string) => void
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function JobCard({ job, onDismiss }: JobCardProps) {
  const router = useRouter()
  const { setJobDescription, reset } = useGenerationStore()

  const handleGenerateResume = () => {
    reset()
    setJobDescription(job.full_description)
    router.push('/generate')
  }

  return (
    <Card className="hover:border-gray-300 transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {job.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- external logo URL from job provider */
              <img
                src={job.logo_url}
                alt={job.company}
                className="h-10 w-10 rounded-lg object-contain bg-gray-50 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-gray-400">
                  {job.company.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {job.relevanceScore > 0 && (
              <Badge
                variant={job.relevanceScore >= 70 ? 'accent' : 'secondary'}
                className="text-[10px]"
              >
                {job.relevanceScore}% match
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] uppercase">
              {JOB_PROVIDER_LABELS[job.provider] || job.provider}
            </Badge>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(job.id)}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Hide this job"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          {job.remote && (
            <Badge variant="accent" className="text-[10px]">
              <Wifi className="h-2.5 w-2.5 mr-0.5" /> Remote
            </Badge>
          )}
          {job.salary && (
            <span className="font-medium text-gray-700">{job.salary}</span>
          )}
          {job.posted_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(job.posted_at)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>

        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {job.tags.length > 4 && (
              <span className="text-[10px] text-gray-400">+{job.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleGenerateResume}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3" /> Generate Resume
          </Button>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> View
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
