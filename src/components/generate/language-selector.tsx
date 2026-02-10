'use client'

import { Globe, Lock } from 'lucide-react'
import { PRESET_LANGUAGES } from '@/lib/templates/languages'

export function LanguageSelector({
  selected,
  onSelect,
  customLanguage,
  onCustomChange,
  isAnnual = false,
}: {
  selected: string
  onSelect: (lang: string) => void
  customLanguage: string
  onCustomChange: (lang: string) => void
  isAnnual?: boolean
}) {
  if (!isAnnual) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        <span>Multi-language generation requires Pro Annual plan</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Document Language</span>
      </div>
      <div className="flex gap-3">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        >
          {PRESET_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName})
            </option>
          ))}
          <option value="custom">Other (type below)</option>
        </select>
        {selected === 'custom' && (
          <input
            type="text"
            value={customLanguage}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="e.g. Turkish, Swahili..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            maxLength={100}
          />
        )}
      </div>
      {selected !== 'en' && (
        <p className="text-xs text-amber-600 mt-1">
          Note: PDF resume downloads for CJK/Arabic/Hindi languages may not render correctly. Text-based documents (cover letter, LinkedIn, email, interview prep) work fine in all languages.
        </p>
      )}
    </div>
  )
}
