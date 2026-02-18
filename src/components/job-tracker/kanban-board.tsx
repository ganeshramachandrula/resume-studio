'use client'

import { JobCard } from './job-card'
import { Badge } from '@/components/ui/badge'
import { JOB_STATUS_LABELS } from '@/lib/constants'
import type { JobApplication, JobStatus } from '@/types/database'

const columns: { status: JobStatus; color: string }[] = [
  { status: 'saved', color: 'bg-gray-500' },
  { status: 'applied', color: 'bg-brand' },
  { status: 'interview', color: 'bg-yellow-500' },
  { status: 'offer', color: 'bg-accent' },
  { status: 'rejected', color: 'bg-red-500' },
]

export function KanbanBoard({
  jobs,
  onRefresh, // eslint-disable-line @typescript-eslint/no-unused-vars -- kept for parent API contract
}: {
  jobs: JobApplication[]
  onRefresh: () => void
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ status, color }) => {
        const columnJobs = jobs.filter((j) => j.status === status)
        return (
          <div
            key={status}
            className="flex-shrink-0 w-64 bg-gray-50 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <h3 className="text-sm font-semibold text-gray-700">
                  {JOB_STATUS_LABELS[status]}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {columnJobs.length}
              </Badge>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {columnJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => {}} />
              ))}
              {columnJobs.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No jobs</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
