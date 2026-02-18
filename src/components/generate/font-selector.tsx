'use client'

import { FONT_OPTIONS } from '@/lib/templates/font-options'
import { Type } from 'lucide-react'

export function FontSelector({
  selected,
  onSelect,
  isAnnual = false,
}: {
  selected: string
  onSelect: (fontId: string) => void
  isAnnual?: boolean
}) {
  if (!isAnnual) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Type className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Font</span>
      </div>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font.id} value={font.id}>
            {font.name}
          </option>
        ))}
      </select>
    </div>
  )
}
