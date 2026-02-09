'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/job-tracker/kanban-board'
import { AddJobDialog } from '@/components/job-tracker/add-job-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Briefcase } from 'lucide-react'
import type { JobApplication } from '@/types/database'

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  async function loadJobs() {
    const supabase = createClient()
    const { data } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setJobs(data as JobApplication[])
    setLoading(false)
  }

  useEffect(() => {
    loadJobs()
  }, [])

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-gray-900">Job Tracker</h1>
          <p className="text-gray-500 mt-1">Track your applications from saved to offer.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Job
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-64 shrink-0" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs tracked yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking your job applications to stay organized.
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Add Your First Job
          </Button>
        </div>
      ) : (
        <KanbanBoard jobs={jobs} onRefresh={loadJobs} />
      )}

      <AddJobDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={loadJobs}
      />
    </div>
  )
}
