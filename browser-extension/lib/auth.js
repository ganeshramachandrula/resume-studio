// Auth helper for checking login state.

async function isLoggedIn() {
  const result = await chrome.storage.local.get(['access_token', 'user_email'])
  return !!(result.access_token && result.user_email)
}

async function getUserEmail() {
  const result = await chrome.storage.local.get(['user_email'])
  return result.user_email || null
}

if (typeof globalThis !== 'undefined') {
  globalThis.ResumeStudioAuth = { isLoggedIn, getUserEmail }
}
