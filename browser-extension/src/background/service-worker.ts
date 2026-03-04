import browser from '@shared/browser-polyfill'

browser.runtime.onInstalled.addListener(() => {
  console.log('[Resume Studio] Extension installed')
})

browser.runtime.onMessage.addListener(
  (message: unknown) => {
    const msg = message as { type: string; url?: string }

    if (msg.type === 'CHECK_AUTH') {
      return browser.storage.local
        .get(['access_token', 'user_email'])
        .then((result) => ({
          loggedIn: !!(result.access_token && result.user_email),
          email: (result.user_email as string) || null,
        }))
    }

    if (msg.type === 'LOGOUT') {
      return browser.storage.local
        .remove(['access_token', 'refresh_token', 'user_email', 'user_id'])
        .then(() => ({ success: true }))
    }

    if (msg.type === 'OPEN_TAB') {
      browser.tabs.create({ url: msg.url })
      return Promise.resolve({ success: true })
    }

    if (msg.type === 'GET_JOB_DATA') {
      return browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (!tabs[0]?.id) return { job: null }
          return browser.tabs.sendMessage(tabs[0].id, { type: 'GET_JOB_DATA' })
        })
        .catch(() => ({ job: null }))
    }

    return undefined
  }
)
