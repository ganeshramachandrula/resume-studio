// Resume Studio Background Service Worker
// Handles messages between popup and content scripts.

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Resume Studio] Extension installed')
})

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    chrome.storage.local.get(['access_token', 'user_email'], (result) => {
      sendResponse({
        loggedIn: !!(result.access_token && result.user_email),
        email: result.user_email || null,
      })
    })
    return true // Keep message channel open for async response
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.local.remove(
      ['access_token', 'refresh_token', 'user_email', 'user_id'],
      () => {
        sendResponse({ success: true })
      }
    )
    return true
  }

  if (message.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: message.url })
    sendResponse({ success: true })
    return false
  }
})
