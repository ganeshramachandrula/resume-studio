// API helper for communicating with Resume Studio backend.
// Default to localhost for development; change for production.

const API_BASE_URL = 'https://resume-studio.io'

/**
 * Get the stored auth token from chrome.storage.local.
 */
async function getAuthToken() {
  const result = await chrome.storage.local.get(['access_token'])
  return result.access_token || null
}

/**
 * Store auth credentials after login.
 */
async function storeAuth(data) {
  await chrome.storage.local.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_email: data.user?.email || '',
    user_id: data.user?.id || '',
  })
}

/**
 * Clear stored auth credentials.
 */
async function clearAuth() {
  await chrome.storage.local.remove([
    'access_token',
    'refresh_token',
    'user_email',
    'user_id',
  ])
}

/**
 * Login to Resume Studio via the extension API.
 */
async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/extension-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')

  await storeAuth(data)
  return data
}

/**
 * Submit a job description captured from a page.
 */
async function submitJobDescription(rawText, sourceUrl, sourceSite) {
  const token = await getAuthToken()
  if (!token) throw new Error('Not logged in. Please log in first.')

  const res = await fetch(`${API_BASE_URL}/api/extension/submit-jd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      raw_text: rawText,
      source_url: sourceUrl,
      source_site: sourceSite,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Submission failed')

  return data
}

// Export for use in other scripts
if (typeof globalThis !== 'undefined') {
  globalThis.ResumeStudioAPI = {
    API_BASE_URL,
    getAuthToken,
    storeAuth,
    clearAuth,
    login,
    submitJobDescription,
  }
}
