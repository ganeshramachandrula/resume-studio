import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '.description__text',
  '.jobs-description__content',
  '.jobs-box__html-content',
  '[data-job-description]',
  '.job-view-layout .description',
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
    document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim() ||
    document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() ||
    document.querySelector('h1.t-24')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('.jobs-unified-top-card__company-name a')?.textContent?.trim() ||
    document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.textContent?.trim() ||
    document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim() ||
    null

  return { company, role }
}
