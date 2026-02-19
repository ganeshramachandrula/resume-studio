'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/lib/job-feed/countries'

interface JobSearchBarProps {
  initialQuery?: string
  initialLocation?: string
  initialCountry?: string
  initialRemoteOnly?: boolean
  onSearch: (query: string, location: string, country: string, remoteOnly: boolean) => void
  searching: boolean
}

export function JobSearchBar({
  initialQuery = '',
  initialLocation = '',
  initialCountry = 'US',
  initialRemoteOnly = false,
  onSearch,
  searching,
}: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [country, setCountry] = useState(initialCountry)
  const [remoteOnly, setRemoteOnly] = useState(initialRemoteOnly)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    onSearch(query.trim(), location.trim(), country, remoteOnly)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, skills, or keywords..."
          className="pl-9"
        />
      </div>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="relative w-40">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City (optional)"
          className="pl-9"
        />
      </div>
      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remoteOnly}
          onChange={(e) => setRemoteOnly(e.target.checked)}
          className="rounded border-gray-300 text-brand focus:ring-brand/30"
        />
        Remote
      </label>
      <Button type="submit" disabled={searching || query.trim().length < 2}>
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        Search
      </Button>
    </form>
  )
}
