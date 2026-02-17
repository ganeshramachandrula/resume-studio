// Monster job description extractor.

function extractMonsterJD() {
  const selectors = [
    '.job-description',
    '[data-testid="svx-jobview-description"]',
    '.details-content',
    '.job-openings-description',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractMonsterJD = extractMonsterJD
}
