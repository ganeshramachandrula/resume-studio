import { useState, useEffect } from 'preact/hooks'
import browser from '@shared/browser-polyfill'
import { clearAuth } from '@shared/storage'
import type { JobExtraction } from '@shared/types'

declare const __API_BASE_URL__: string

interface Props {
  email: string
  onLogout: () => void
}

export function LoggedInView({ email, onLogout }: Props) {
  const [job, setJob] = useState<JobExtraction | null>(null)
  const [lastJdId, setLastJdId] = useState<string | null>(null)

  useEffect(() => {
    // Request current job data from content script via background
    browser.runtime
      .sendMessage({ type: 'GET_JOB_DATA' })
      .then((res: unknown) => {
        const data = res as { job: JobExtraction | null } | null
        if (data?.job) setJob(data.job)
      })
      .catch(() => {})

    // Check for last submission
    browser.storage.local.get('last_jd_id').then((r) => {
      if (r.last_jd_id) setLastJdId(r.last_jd_id as string)
    })
  }, [])

  const handleLogout = async () => {
    await clearAuth()
    onLogout()
  }

  const openApp = () => {
    browser.tabs.create({ url: `${__API_BASE_URL__}/dashboard` })
  }

  const openATS = () => {
    if (lastJdId) {
      browser.tabs.create({ url: `${__API_BASE_URL__}/generate?jd_id=${lastJdId}` })
    }
  }

  return (
    <div>
      <div class="status">
        <div class="status-dot" />
        <span class="status-text">{email}</span>
      </div>

      {job?.meta?.company || job?.meta?.role ? (
        <div>
          <div class="section-label">Current Job</div>
          <div class="job-card">
            {job.meta.role && <div class="job-card-title">{job.meta.role}</div>}
            {job.meta.company && <div class="job-card-company">{job.meta.company}</div>}
          </div>
        </div>
      ) : (
        <p class="info">
          Navigate to a job listing on Indeed, LinkedIn, Monster, Glassdoor, Dice, or ZipRecruiter
          to capture job descriptions.
        </p>
      )}

      <div class="section-label">Quick Actions</div>
      <div class="actions">
        <button class="btn btn-primary" onClick={openApp}>
          Open Resume Studio
        </button>
        {lastJdId && (
          <button class="btn btn-accent" onClick={openATS}>
            View ATS Score
          </button>
        )}
        <button class="btn btn-ghost" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}
