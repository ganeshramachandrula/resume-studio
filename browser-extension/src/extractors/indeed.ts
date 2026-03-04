import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '#jobDescriptionText',
  '.jobsearch-jobDescriptionText',
  '[data-testid="jobDescriptionText"]',
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
    document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() ||
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
    document.querySelector('h1.icl-u-xs-mb--xs')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ||
    document.querySelector('.jobsearch-InlineCompanyRating a')?.textContent?.trim() ||
    document.querySelector('[data-company-name]')?.getAttribute('data-company-name') ||
    document.querySelector('.icl-u-lg-mr--sm a')?.textContent?.trim() ||
    null

  return { company, role }
}
