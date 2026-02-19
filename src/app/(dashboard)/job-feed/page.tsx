'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useJobFeedStore, filterJobs } from '@/store/job-feed-store'
import { useAppStore } from '@/store/app-store'
import { JobSearchBar } from '@/components/job-feed/job-search-bar'
import { JobCard } from '@/components/job-feed/job-card'
import { JobFilters } from '@/components/job-feed/job-filters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings2, Loader2, SearchX, Crown } from 'lucide-react'

export default function JobFeedPage() {
  const router = useRouter()
  const { profile } = useAppStore()
  const {
    jobs,
    preferences,
    filters,
    searching,
    loading,
    error,
    totalResults,
    remainingSearches,
    providersQueried,
    setJobs,
    setPreferences,
    setSearching,
    setLoading,
    setError,
    setTotalResults,
    setRemainingSearches,
    setProvidersQueried,
  } = useJobFeedStore()

  const isFree = profile?.plan === 'free'

  // Load preferences on mount
  useEffect(() => {
    let cancelled = false
    async function loadPreferences() {
      setLoading(true)
      try {
        const res = await fetch('/api/jobs/preferences')
        const data = await res.json()
        if (!cancelled && data.preferences) {
          setPreferences(data.preferences)
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPreferences()
    return () => { cancelled = true }
  }, [setPreferences, setLoading])

  const handleSearch = useCallback(
    async (query: string, location: string, country?: string, remoteOnly?: boolean) => {
      setSearching(true)
      setError(null)

      try {
        const res = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            location: location || undefined,
            country: country || undefined,
            remote_only: remoteOnly || false,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Search failed')

        setJobs(data.jobs)
        setTotalResults(data.total)
        setRemainingSearches(data.remaining)
        setProvidersQueried(data.providers_queried)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSearching(false)
      }
    },
    [setJobs, setSearching, setError, setTotalResults, setRemainingSearches, setProvidersQueried]
  )

  // Auto-search on mount if preferences exist and no jobs loaded
  useEffect(() => {
    if (preferences && jobs.length === 0 && !searching && !loading) {
      const query = [...(preferences.roles || []), ...(preferences.skills || []).slice(0, 3)].join(' ')
      if (query.trim().length >= 2) {
        const location = (preferences.locations || [])[0] || ''
        handleSearch(query, location, preferences.country || 'US')
      }
    }
  }, [preferences, jobs.length, searching, loading, handleSearch])

  const filteredJobs = filterJobs(jobs, filters)
  const defaultQuery =
    preferences
      ? [...(preferences.roles || []), ...(preferences.skills || []).slice(0, 3)].join(' ')
      : ''
  const defaultLocation = (preferences?.locations || [])[0] || ''

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-gray-900">Job Feed</h1>
          <p className="text-gray-500 text-sm">
            Discover jobs from multiple providers and generate tailored resumes.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/job-feed/preferences')}
        >
          <Settings2 className="h-4 w-4" /> Preferences
        </Button>
      </div>

      {!preferences && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-6 text-center">
          <p className="text-gray-700 mb-3">
            Set up your job preferences to get personalized search results.
          </p>
          <Button onClick={() => router.push('/job-feed/preferences')}>
            <Settings2 className="h-4 w-4" /> Set Preferences
          </Button>
        </div>
      )}

      <JobSearchBar
        initialQuery={defaultQuery}
        initialLocation={defaultLocation}
        initialCountry={preferences?.country || 'US'}
        onSearch={handleSearch}
        searching={searching}
      />

      {/* Status bar */}
      {(totalResults > 0 || remainingSearches !== null) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}</span>
            {providersQueried.length > 0 && (
              <span>from {providersQueried.length} provider{providersQueried.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {remainingSearches !== null && (
            <Badge variant="secondary" className="text-xs">
              {remainingSearches} search{remainingSearches !== 1 ? 'es' : ''} remaining today
            </Badge>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {jobs.length > 0 && <JobFilters />}

      {/* Results */}
      {searching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand mr-2" />
          <span className="text-gray-500">Searching across providers...</span>
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {isFree && totalResults >= 10 && (
            <div className="bg-gradient-to-r from-brand/5 to-accent/5 border border-brand/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
                <Crown className="h-4 w-4 text-brand" />
                <span className="font-medium">Upgrade for more results</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Free users see up to 10 results. Pro users get up to 50 per search.
              </p>
              <Button size="sm" onClick={() => router.push('/upgrade')}>
                Upgrade to Pro
              </Button>
            </div>
          )}
        </>
      ) : jobs.length > 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-500">
          <SearchX className="h-8 w-8 mb-2" />
          <p>No jobs match your filters. Try adjusting them.</p>
        </div>
      ) : null}
    </div>
  )
}
