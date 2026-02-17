// Indeed job description extractor.

function extractIndeedJD() {
  // Primary selector
  const el = document.getElementById('jobDescriptionText')
  if (el) return el.innerText.trim()

  // Fallback selectors
  const selectors = [
    '.jobsearch-jobDescriptionText',
    '[data-testid="jobDescriptionText"]',
    '.job-description',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractIndeedJD = extractIndeedJD
}
