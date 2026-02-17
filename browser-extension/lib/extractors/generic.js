// Generic job description extractor for unknown sites.
// Uses common patterns and heuristics.

function extractGenericJD() {
  // Try common selectors
  const selectors = [
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

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found && found.innerText.trim().length > 100) {
      return found.innerText.trim()
    }
  }

  // Fallback: Look for the longest text block in <article> or <main>
  const containers = document.querySelectorAll('article, main, [role="main"]')
  let longest = ''
  for (const container of containers) {
    const text = container.innerText.trim()
    if (text.length > longest.length) longest = text
  }

  if (longest.length > 200) return longest

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractGenericJD = extractGenericJD
}
