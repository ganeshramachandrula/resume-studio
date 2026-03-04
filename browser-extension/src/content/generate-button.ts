import browser from '@shared/browser-polyfill'
import { getAuthToken } from '@shared/storage'
import { submitJD } from '@shared/api-client'
import { detectSite, extractJD } from '@extractors/index'

const BUTTON_ID = 'resume-studio-generate-btn'

const ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
  <polyline points="14 2 14 8 20 8"/>
</svg>`

const DEFAULT_HTML = `${ICON_SVG} Generate Resume`

function updateButton(text: string, disabled: boolean, isError: boolean) {
  const btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null
  if (!btn) return
  btn.innerHTML = text
  btn.disabled = disabled
  if (isError) {
    btn.style.background = '#ef4444'
    setTimeout(() => {
      btn.style.background = ''
      btn.innerHTML = DEFAULT_HTML
      btn.disabled = false
    }, 3000)
  }
}

async function handleClick() {
  const token = await getAuthToken()
  if (!token) {
    updateButton('Please log in via the extension popup', true, true)
    return
  }

  const site = detectSite()
  const jdText = extractJD(site)

  if (!jdText || jdText.length < 50) {
    updateButton('Could not extract job description', true, true)
    return
  }

  updateButton('Sending to Resume Studio...', true, false)

  try {
    const data = await submitJD(jdText, window.location.href, site)
    // Store JD ID for ATS link in popup
    browser.storage.local.set({ last_jd_id: data.job_description_id })
    window.open(data.full_url, '_blank')
    updateButton('Sent! Opening Resume Studio...', true, false)
    setTimeout(() => {
      const btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null
      if (btn) {
        btn.innerHTML = DEFAULT_HTML
        btn.disabled = false
      }
    }, 2000)
  } catch (err) {
    updateButton((err as Error).message || 'Error submitting', true, true)
  }
}

export function createGenerateButton(): HTMLButtonElement | null {
  if (document.getElementById(BUTTON_ID)) return null

  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.innerHTML = DEFAULT_HTML
  btn.addEventListener('click', handleClick)
  return btn
}

export function removeGenerateButton() {
  document.getElementById(BUTTON_ID)?.remove()
}
