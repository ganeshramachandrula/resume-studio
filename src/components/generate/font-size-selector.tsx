'use client'

import { cn } from '@/lib/utils'
import { FONT_SIZE_OPTIONS } from '@/lib/templates/font-sizes'
import type { FontSizeKey } from '@/lib/templates/types'
import { AArrowUp } from 'lucide-react'

export function FontSizeSelector({
  selected,
  onSelect,
  isAnnual = false,
}: {
  selected: FontSizeKey
  onSelect: (size: FontSizeKey) => void
  isAnnual?: boolean
}) {
  if (!isAnnual) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <AArrowUp className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Font Size</span>
      </div>
      <div className="flex gap-1">
        {FONT_SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors',
              selected === opt.id
                ? 'border-brand bg-brand/10 text-brand font-medium'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
