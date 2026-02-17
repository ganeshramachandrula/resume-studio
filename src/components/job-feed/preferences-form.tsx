'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TagInput } from './tag-input'
import { Loader2, Save } from 'lucide-react'
import type { JobPreferences, RemotePreference } from '@/types/job-feed'

interface PreferencesFormProps {
  initialPreferences: JobPreferences | null
  onSave: (prefs: JobPreferences) => void
  loading?: boolean
}

const REMOTE_OPTIONS: { value: RemotePreference; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

export function PreferencesForm({ initialPreferences, onSave, loading }: PreferencesFormProps) {
  const [skills, setSkills] = useState<string[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [remotePreference, setRemotePreference] = useState<RemotePreference>('any')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialPreferences) {
      setSkills(initialPreferences.skills || [])
      setRoles(initialPreferences.roles || [])
      setLocations(initialPreferences.locations || [])
      setSalaryMin(initialPreferences.salary_min?.toString() || '')
      setSalaryMax(initialPreferences.salary_max?.toString() || '')
      setRemotePreference(initialPreferences.remote_preference || 'any')
    }
  }, [initialPreferences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (roles.length === 0 && skills.length === 0) {
      setError('Please add at least one role or skill.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/jobs/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          roles,
          locations,
          salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
          salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
          remote_preference: remotePreference,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences')
      onSave(data.preferences)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TagInput
        label="Target Roles"
        tags={roles}
        onTagsChange={setRoles}
        placeholder="e.g. Frontend Developer"
        maxTags={10}
      />

      <TagInput
        label="Key Skills"
        tags={skills}
        onTagsChange={setSkills}
        placeholder="e.g. React, TypeScript"
        maxTags={20}
      />

      <TagInput
        label="Preferred Locations"
        tags={locations}
        onTagsChange={setLocations}
        placeholder="e.g. San Francisco, New York"
        maxTags={10}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Salary (USD/yr)</label>
          <Input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g. 80000"
            min={0}
            max={1000000}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Salary (USD/yr)</label>
          <Input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g. 150000"
            min={0}
            max={1000000}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Remote Preference</label>
        <div className="flex gap-2 flex-wrap">
          {REMOTE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRemotePreference(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                remotePreference === value
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <Button type="submit" disabled={saving || loading}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Save Preferences
          </>
        )}
      </Button>
    </form>
  )
}
