'use client'

import { cn } from '@/lib/utils'
import { Palette } from 'lucide-react'

const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean, two-column layout with blue accents' },
  { id: 'classic', name: 'Classic', description: 'Traditional single-column, corporate style' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean with focus on content' },
]

export function TemplateSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (template: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all',
            selected === template.id
              ? 'border-brand bg-brand/5'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
            <Palette className="h-4 w-4 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">{template.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
        </button>
      ))}
    </div>
  )
}
