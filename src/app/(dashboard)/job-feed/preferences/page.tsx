'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PreferencesForm } from '@/components/job-feed/preferences-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { JobPreferences } from '@/types/job-feed'

export default function JobFeedPreferencesPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<JobPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/jobs/preferences')
        const data = await res.json()
        if (data.preferences) setPreferences(data.preferences)
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = (prefs: JobPreferences) => {
    setPreferences(prefs)
    router.push('/job-feed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/job-feed')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Job Feed
        </Button>
        <h1 className="text-2xl font-display text-gray-900">Job Preferences</h1>
        <p className="text-gray-500 text-sm">
          Set your target roles, skills, and preferences to get personalized search results.
        </p>
      </div>

      <PreferencesForm
        initialPreferences={preferences}
        onSave={handleSave}
      />
    </div>
  )
}
