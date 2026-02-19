'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { JOB_SITES, CATEGORIES, type JobSite } from '@/lib/job-sites'
import { COUNTRIES } from '@/lib/job-feed/countries'
import { cn } from '@/lib/utils'

export default function JobSitesPage() {
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { countrySites, globalSites } = useMemo(() => {
    const categoryFiltered = selectedCategory === 'all'
      ? JOB_SITES
      : JOB_SITES.filter((s) => s.category === selectedCategory)

    if (selectedCountry === 'ALL') {
      return { countrySites: categoryFiltered, globalSites: [] }
    }

    const country: JobSite[] = []
    const global: JobSite[] = []
    for (const site of categoryFiltered) {
      if (site.countries.includes(selectedCountry)) {
        country.push(site)
      } else if (site.countries.includes('GLOBAL')) {
        global.push(site)
      }
    }
    return { countrySites: country, globalSites: global }
  }, [selectedCountry, selectedCategory])

  const totalCount = countrySites.length + globalSites.length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Sites</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse popular job boards and career platforms around the world
        </p>
      </div>

      {/* Country filter pills */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCountry('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              selectedCountry === 'ALL'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Countries
          </button>
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                selectedCountry === c.code
                  ? 'bg-brand text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat.value
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{totalCount} sites</p>

      {totalCount > 0 ? (
        <div className="space-y-8">
          {/* Country-specific sites */}
          {countrySites.length > 0 && (
            <div>
              {selectedCountry !== 'ALL' && (
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {COUNTRIES.find((c) => c.code === selectedCountry)?.name ?? selectedCountry} Sites
                </h2>
              )}
              <SiteGrid sites={countrySites} />
            </div>
          )}

          {/* Global sites (only shown when a country is selected) */}
          {globalSites.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Global Sites</h2>
              <SiteGrid sites={globalSites} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No sites match the current filters.</p>
          <button
            onClick={() => { setSelectedCountry('ALL'); setSelectedCategory('all') }}
            className="mt-2 text-sm text-brand hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

function SiteGrid({ sites }: { sites: JobSite[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sites.map((site) => (
        <div
          key={site.id}
          className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- Google Favicon API */}
            <img
              src={site.logo_url}
              alt={site.name}
              className="h-10 w-10 rounded-lg object-contain bg-gray-50 shrink-0"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div
              className="h-10 w-10 rounded-lg bg-gray-100 items-center justify-center shrink-0 hidden"
            >
              <span className="text-sm font-bold text-gray-400">
                {site.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {site.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{site.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <Badge variant="outline" className="text-xs capitalize">
              {site.category}
            </Badge>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark transition-colors"
            >
              Visit Site
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
