'use client'

import { cn } from '@/lib/utils'
import { Palette, Lock, Crown } from 'lucide-react'
import { ALL_TEMPLATES } from '@/lib/templates/all-templates'

export function TemplateSelector({
  selected,
  onSelect,
  isAnnual = false,
}: {
  selected: string
  onSelect: (template: string) => void
  isAnnual?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Resume Template</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ALL_TEMPLATES.map((template) => {
          const locked = template.premium && !isAnnual
          return (
            <button
              key={template.id}
              onClick={() => !locked && onSelect(template.id)}
              disabled={locked}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all relative',
                selected === template.id
                  ? 'border-brand bg-brand/5'
                  : locked
                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {locked && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-3 w-3 text-gray-400" />
                </div>
              )}
              {template.premium && !locked && (
                <div className="absolute top-2 right-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                </div>
              )}
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
            </button>
          )
        })}
      </div>
      {!isAnnual && (
        <p className="text-xs text-gray-400 mt-2">
          <Lock className="inline h-3 w-3 mr-1" />
          Premium templates require Pro Annual plan
        </p>
      )}
    </div>
  )
}
