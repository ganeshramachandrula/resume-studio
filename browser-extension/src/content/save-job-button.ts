import { getAuthToken } from '@shared/storage'
import { saveJob } from '@shared/api-client'
import type { JobMeta } from '@shared/types'

const BUTTON_ID = 'resume-studio-save-btn'

const SAVE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
  <polyline points="17 21 17 13 7 13 7 21"/>
  <polyline points="7 3 7 8 15 8"/>
</svg>`

const DEFAULT_HTML = `${SAVE_ICON} Save to Tracker`

function updateButton(text: string, disabled: boolean, isError: boolean, isSuccess?: boolean) {
  const btn = document.getElementById(BUTTON_ID) as HTMLButtonElement | null
  if (!btn) return
  btn.innerHTML = text
  btn.disabled = disabled
  if (isError) {
    btn.style.background = '#ef4444'
  } else if (isSuccess) {
    btn.style.background = '#10B981'
  }
  if (isError || isSuccess) {
    setTimeout(() => {
      btn.style.background = ''
      btn.innerHTML = DEFAULT_HTML
      btn.disabled = false
    }, 3000)
  }
}

async function handleClick(meta: JobMeta) {
  const token = await getAuthToken()
  if (!token) {
    updateButton('Please log in first', true, true)
    return
  }

  if (!meta.company && !meta.role) {
    updateButton('Could not detect job info', true, true)
    return
  }

  updateButton('Saving...', true, false)

  try {
    await saveJob(
      meta.company || 'Unknown Company',
      meta.role || 'Unknown Role',
      window.location.href
    )
    updateButton('Saved!', true, false, true)
  } catch (err) {
    updateButton((err as Error).message || 'Error saving', true, true)
  }
}

export function createSaveButton(meta: JobMeta): HTMLButtonElement | null {
  if (document.getElementById(BUTTON_ID)) return null

  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.innerHTML = DEFAULT_HTML
  btn.addEventListener('click', () => handleClick(meta))
  return btn
}

export function removeSaveButton() {
  document.getElementById(BUTTON_ID)?.remove()
}
