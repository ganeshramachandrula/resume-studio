'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface JobSearchBarProps {
  initialQuery?: string
  initialLocation?: string
  onSearch: (query: string, location: string) => void
  searching: boolean
}

export function JobSearchBar({ initialQuery = '', initialLocation = '', onSearch, searching }: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    onSearch(query.trim(), location.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, skills, or keywords..."
          className="pl-9"
        />
      </div>
      <div className="relative w-48">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="pl-9"
        />
      </div>
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
