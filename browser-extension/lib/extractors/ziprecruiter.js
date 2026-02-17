// ZipRecruiter job description extractor.

function extractZipRecruiterJD() {
  const selectors = [
    '.job_description',
    '.jobDescriptionSection',
    '[data-testid="job-description"]',
    '.job-description-text',
  ]

  for (const sel of selectors) {
    const found = document.querySelector(sel)
    if (found) return found.innerText.trim()
  }

  return null
}

if (typeof globalThis !== 'undefined') {
  globalThis.extractZipRecruiterJD = extractZipRecruiterJD
}
