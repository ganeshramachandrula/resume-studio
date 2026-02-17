// LinkedIn job description extractor.

function extractLinkedInJD() {
  const selectors = [
    '.description__text',
    '.jobs-description__content',
    '.jobs-box__html-content',
    '[data-job-description]',
    '.job-view-layout .description',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractLinkedInJD = extractLinkedInJD
}
