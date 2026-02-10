import type { TemplateEntry } from './types'
import { PREMIUM_CONFIGS } from './premium-configs'

/** 3 free templates (rendered by their own components in pdf-generator) */
const FREE_TEMPLATES: TemplateEntry[] = [
  { id: 'modern', name: 'Modern', description: 'Clean, two-column layout with blue accents', premium: false },
  { id: 'classic', name: 'Classic', description: 'Traditional single-column, corporate style', premium: false },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean with focus on content', premium: false },
]

/** 10 premium templates (rendered by the configurable engine) */
const PREMIUM_TEMPLATES: TemplateEntry[] = PREMIUM_CONFIGS.map((cfg) => ({
  id: cfg.id,
  name: cfg.name,
  description: cfg.description,
  premium: true,
  config: cfg,
}))

/** All 13 templates: 3 free + 10 premium */
export const ALL_TEMPLATES: TemplateEntry[] = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES]

export function getTemplateEntry(id: string): TemplateEntry | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id)
}

export function isPremiumTemplate(id: string): boolean {
  const entry = getTemplateEntry(id)
  return entry?.premium ?? false
}
