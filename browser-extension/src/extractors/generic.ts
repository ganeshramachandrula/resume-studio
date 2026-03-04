import type { JobMeta } from '@shared/types'

const JD_SELECTORS = [
  '.job-description',
  '.job_description',
  '#job-description',
  '#job_description',
  '[class*="jobDescription"]',
  '[class*="job-description"]',
  '[data-testid*="description"]',
  '.description__text',
  '.posting-description',
  'article .description',
]

export function extractJD(): string | null {
  for (const sel of JD_SELECTORS) {
    const el = document.querySelector(sel)
    if (el && (el.textContent?.trim().length ?? 0) > 100) {
      return el.textContent!.trim()
    }
  }

  // Fallback: longest text in article/main
  const containers = document.querySelectorAll('article, main, [role="main"]')
  let longest = ''
  for (const c of containers) {
    const t = c.textContent?.trim() ?? ''
    if (t.length > longest.length) longest = t
  }

  return longest.length > 200 ? longest : null
}

export function extractMeta(): JobMeta {
  const role = document.querySelector('h1')?.textContent?.trim() || null
  const company = document.querySelector('[class*="company"]')?.textContent?.trim() || null
  return { company, role }
}
