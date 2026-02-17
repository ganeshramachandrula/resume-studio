'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TagInputProps {
  label: string
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ label, tags, onTagsChange, placeholder = 'Type and press Enter', maxTags = 20 }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const value = input.trim()
    if (!value) return
    if (tags.includes(value)) {
      setInput('')
      return
    }
    if (tags.length >= maxTags) return
    onTagsChange([...tags, value])
    setInput('')
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand text-xs font-medium rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:bg-brand/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 p-0 h-7 text-sm"
        />
      </div>
      {maxTags && (
        <p className="text-xs text-gray-400 mt-1">
          {tags.length}/{maxTags}
        </p>
      )}
    </div>
  )
}
