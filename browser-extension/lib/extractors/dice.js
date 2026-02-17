// Dice job description extractor.

function extractDiceJD() {
  const selectors = [
    '[data-testid="jobDescriptionHtml"]',
    '.job-description',
    '#jobDescriptionText',
    '.job-detail-description',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractDiceJD = extractDiceJD
}
