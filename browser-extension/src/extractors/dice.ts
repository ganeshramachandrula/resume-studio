import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '[data-testid="jobDescriptionHtml"]',
  '.job-description',
  '#jobDescriptionText',
  '.job-detail-description',
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
    document.querySelector('[data-cy="jobTitle"]')?.textContent?.trim() ||
    document.querySelector('h1.jobTitle')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('[data-cy="companyNameLink"]')?.textContent?.trim() ||
    document.querySelector('.employer-name a')?.textContent?.trim() ||
    document.querySelector('[data-testid="employer-name"]')?.textContent?.trim() ||
    null

  return { company, role }
}
