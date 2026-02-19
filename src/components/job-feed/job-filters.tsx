'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { JOB_PROVIDERS, JOB_PROVIDER_LABELS } from '@/lib/constants'
import { useJobFeedStore } from '@/store/job-feed-store'
import { Filter, Wifi, ArrowUpDown, Calendar } from 'lucide-react'
import type { JobProvider, DateRange } from '@/types/job-feed'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '1 month' },
]

export function JobFilters() {
  const { filters, setFilters } = useJobFeedStore()

  const toggleProvider = (provider: JobProvider) => {
    const current = filters.providers
    if (current.includes(provider)) {
      setFilters({ providers: current.filter((p) => p !== provider) })
    } else {
      setFilters({ providers: [...current, provider] })
    }
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" /> Filters
      </div>

      {/* Provider filter */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Providers</p>
        <div className="flex flex-wrap gap-1.5">
          {JOB_PROVIDERS.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => toggleProvider(provider as JobProvider)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                filters.providers.includes(provider as JobProvider)
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {JOB_PROVIDER_LABELS[provider]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Remote toggle */}
        <button
          type="button"
          onClick={() => setFilters({ remote_only: !filters.remote_only })}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filters.remote_only
              ? 'bg-accent text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Wifi className="h-3 w-3" /> Remote Only
        </button>

        {/* Sort */}
        <button
          type="button"
          onClick={() =>
            setFilters({ sort_by: filters.sort_by === 'date' ? 'relevance' : 'date' })
          }
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <ArrowUpDown className="h-3 w-3" />
          {filters.sort_by === 'date' ? 'Newest First' : 'Relevance'}
        </button>

        {/* Date range */}
        <div className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-500" />
          {DATE_RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilters({ date_range: value })}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.date_range === value
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Location filter */}
      <div>
        <Input
          value={filters.location}
          onChange={(e) => setFilters({ location: e.target.value })}
          placeholder="Filter by location..."
          className="text-sm h-8"
        />
      </div>

      {/* Active filters indicator */}
      {(filters.providers.length > 0 || filters.remote_only || filters.location || filters.date_range !== '30d') && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Active:</span>
          {filters.providers.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {filters.providers.length} provider{filters.providers.length > 1 ? 's' : ''}
            </Badge>
          )}
          {filters.remote_only && (
            <Badge variant="accent" className="text-[10px]">Remote</Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="text-[10px]">{filters.location}</Badge>
          )}
          {filters.date_range !== '30d' && (
            <Badge variant="secondary" className="text-[10px]">
              {filters.date_range === '7d' ? '7 days' : '14 days'}
            </Badge>
          )}
          <button
            type="button"
            onClick={() =>
              setFilters({ providers: [], remote_only: false, location: '', search_query: '', date_range: '30d' })
            }
            className="text-xs text-red-500 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
