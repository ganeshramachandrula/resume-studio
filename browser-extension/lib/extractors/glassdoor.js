// Glassdoor job description extractor.

function extractGlassdoorJD() {
  const selectors = [
    '.jobDescriptionContent',
    '[data-test="jobDescriptionContent"]',
    '.desc',
    '.job-description',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractGlassdoorJD = extractGlassdoorJD
}
