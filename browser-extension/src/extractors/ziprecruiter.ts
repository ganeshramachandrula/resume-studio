import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '.job_description',
  '.jobDescriptionSection',
  '[data-testid="job-description"]',
  '.job-description-text',
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
    document.querySelector('.job_title')?.textContent?.trim() ||
    document.querySelector('h1[class*="title"]')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    null

  const company =
    document.querySelector('.hiring_company_text a')?.textContent?.trim() ||
    document.querySelector('[class*="companyName"]')?.textContent?.trim() ||
    null

  return { company, role }
}
