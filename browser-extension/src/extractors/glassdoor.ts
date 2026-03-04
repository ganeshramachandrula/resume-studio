import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '.jobDescriptionContent',
  '[data-test="jobDescriptionContent"]',
  '.desc',
  '.job-description',
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
    document.querySelector('[data-test="job-title"]')?.textContent?.trim() ||
    document.querySelector('.e1tk4kwz4')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('[data-test="employer-name"]')?.textContent?.trim() ||
    document.querySelector('.e1tk4kwz1')?.textContent?.trim() ||
    null

  return { company, role }
}
