import browser from '@shared/browser-polyfill'
import { detectSite, extractJD, extractMeta } from '@extractors/index'
import { createGenerateButton, removeGenerateButton } from './generate-button'
import { createSaveButton, removeSaveButton } from './save-job-button'
import { createGhostboardWidget, removeGhostboardWidget } from './ghostboard-widget'
import type { JobExtraction } from '@shared/types'

let currentExtraction: JobExtraction | null = null

function cleanup() {
  removeGenerateButton()
  removeSaveButton()
  removeGhostboardWidget()
  currentExtraction = null
}

async function init() {
  const site = detectSite()
  const jd = extractJD(site)

  if (!jd || jd.length < 50) {
    // Retry after delay for SPAs
    setTimeout(async () => {
      const jdRetry = extractJD(site)
      if (jdRetry && jdRetry.length >= 50) {
        await inject(site, jdRetry)
      }
    }, 3000)
    return
  }

  await inject(site, jd)
}

async function inject(site: ReturnType<typeof detectSite>, jd: string) {
  const meta = extractMeta(site)
  currentExtraction = { jd, meta, site }

  // Generate Resume button
  const genBtn = createGenerateButton()
  if (genBtn) document.body.appendChild(genBtn)

  // Save to Tracker button
  const saveBtn = createSaveButton(meta)
  if (saveBtn) document.body.appendChild(saveBtn)

  // GhostBoard widget
  const widget = await createGhostboardWidget(meta)
  if (widget) document.body.appendChild(widget)
}

// Listen for messages from popup/background
browser.runtime.onMessage.addListener(
  (message: unknown) => {
    const msg = message as { type: string }
    if (msg.type === 'GET_JOB_DATA') {
      return Promise.resolve({ job: currentExtraction })
    }
    return undefined
  }
)

// SPA navigation detection
let lastUrl = location.href
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    cleanup()
    setTimeout(init, 1000)
  }
}).observe(document.body, { childList: true, subtree: true })

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void init())
} else {
  void init()
}
