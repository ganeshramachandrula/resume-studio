import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '.job-description',
  '[data-testid="svx-jobview-description"]',
  '.details-content',
  '.job-openings-description',
]

export function extractJD(): string | null {
  for (const sel of JD_SELECTORS) {
    const el = document.querySelector(sel)
    if (el) return el.textContent?.trim() || null
  }
  return null
}

export function extractMeta(): JobMeta {
  const role =
    document.querySelector('.title')?.textContent?.trim() ||
    document.querySelector('[data-testid="svx-jobview-title"]')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('.company')?.textContent?.trim() ||
    document.querySelector('[data-testid="svx-jobview-company"]')?.textContent?.trim() ||
    null

  return { company, role }
}
