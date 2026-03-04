'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | undefined
  onChange: (value: number) => void
  label?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function StarRating({ value, onChange, label, size = 'md', disabled = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-gray-600">{label}</span>
      )}
      <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || value || 0)
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onMouseEnter={() => !disabled && setHovered(star)}
              onClick={() => !disabled && onChange(star)}
              className={cn(
                'transition-colors',
                disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              )}
            >
              <Star
                className={cn(
                  starSize,
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-gray-300'
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Read-only star display */
export function StarDisplay({ value, size = 'sm' }: { value: number | null; size?: 'sm' | 'md' }) {
  if (value === null || value === undefined) return null
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-gray-300'
          )}
        />
      ))}
    </div>
  )
}
