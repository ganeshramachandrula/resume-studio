'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CITIES,
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  costDifference,
  totalMonthlyCost,
  getRegions,
  type CityData,
  type CostCategory,
} from '@/lib/cost-of-living-data'

function CitySelector({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const regions = getRegions()
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        <option value="">Select a city...</option>
        {regions.map((region) => (
          <optgroup key={region} label={region}>
            {CITIES.filter((c) => c.region === region).map((c) => (
              <option key={`${c.city}-${c.country}`} value={`${c.city}-${c.country}`}>
                {c.city}, {c.country}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-xs text-gray-400 ml-2">same</span>
  const color = diff > 0 ? 'text-red-600' : 'text-green-600'
  return <span className={`text-xs font-medium ml-2 ${color}`}>{diff > 0 ? '+' : ''}{diff}%</span>
}

function CostBar({ value, max, variant }: { value: number; max: number; variant: 'brand' | 'accent' }) {
  const width = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const bg = variant === 'brand' ? 'bg-brand' : 'bg-accent'
  return (
    <div className="h-3 w-full rounded-full bg-gray-100">
      <div className={`h-3 rounded-full ${bg} transition-all duration-300`} style={{ width: `${width}%` }} />
    </div>
  )
}

export default function CostOfLivingPage() {
  const [city1Key, setCity1Key] = useState('')
  const [city2Key, setCity2Key] = useState('')

  const findCity = (key: string): CityData | undefined => {
    if (!key) return undefined
    const [city, country] = key.split('-')
    return CITIES.find((c) => c.city === city && c.country === country)
  }

  const c1 = findCity(city1Key)
  const c2 = findCity(city2Key)

  const maxCost = useMemo(() => {
    if (!c1 || !c2) return 1
    return Math.max(
      ...COST_CATEGORIES.map((cat) => Math.max(c1.costs[cat], c2.costs[cat]))
    )
  }, [c1, c2])

  const total1 = c1 ? totalMonthlyCost(c1) : 0
  const total2 = c2 ? totalMonthlyCost(c2) : 0
  const totalDiff = total1 > 0 ? costDifference(total1, total2) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Cost of Living Comparator</h1>
        <p className="text-gray-500 mt-1">
          Compare living costs between cities to help plan your next move.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CitySelector label="City 1" value={city1Key} onChange={setCity1Key} />
            <CitySelector label="City 2" value={city2Key} onChange={setCity2Key} />
          </div>
        </CardContent>
      </Card>

      {c1 && c2 && (
        <>
          {/* Total comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-body)]">
                Monthly Cost Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-brand/5">
                  <p className="text-sm text-gray-500 mb-1">{c1.city}</p>
                  <p className="text-2xl font-bold text-brand">${total1.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per month</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${totalDiff > 0 ? 'text-red-600' : totalDiff < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {totalDiff > 0 ? '+' : ''}{totalDiff}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {totalDiff > 0
                        ? `${c2.city} is more expensive`
                        : totalDiff < 0
                          ? `${c2.city} is cheaper`
                          : 'Same cost'}
                    </p>
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/5">
                  <p className="text-sm text-gray-500 mb-1">{c2.city}</p>
                  <p className="text-2xl font-bold text-accent">${total2.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">per month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-body)]">
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {COST_CATEGORIES.map((cat) => {
                const v1 = c1.costs[cat]
                const v2 = c2.costs[cat]
                const diff = costDifference(v1, v2)
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {COST_CATEGORY_LABELS[cat]}
                      </span>
                      <DiffBadge diff={diff} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 truncate">{c1.city}</span>
                        <div className="flex-1">
                          <CostBar value={v1} max={maxCost} variant="brand" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16 text-right">${v1.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-28 truncate">{c2.city}</span>
                        <div className="flex-1">
                          <CostBar value={v2} max={maxCost} variant="accent" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16 text-right">${v2.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}

      {(!c1 || !c2) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-lg font-medium mb-1">Select two cities to compare</p>
            <p className="text-sm">Choose cities from the dropdowns above to see a side-by-side cost breakdown.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
