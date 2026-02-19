// Resume Studio Extension Popup

const API_BASE_URL = 'https://resume-studio.io'

const loginSection = document.getElementById('login-section')
const loggedinSection = document.getElementById('loggedin-section')
const loginForm = document.getElementById('login-form')
const loginBtn = document.getElementById('login-btn')
const loginError = document.getElementById('login-error')
const userEmailEl = document.getElementById('user-email')
const openAppBtn = document.getElementById('open-app-btn')
const logoutBtn = document.getElementById('logout-btn')

// Check current auth state on popup open
async function checkAuth() {
  const result = await chrome.storage.local.get(['access_token', 'user_email'])
  if (result.access_token && result.user_email) {
    showLoggedIn(result.user_email)
  } else {
    showLogin()
  }
}

function showLogin() {
  loginSection.classList.remove('hidden')
  loggedinSection.classList.add('hidden')
}

function showLoggedIn(email) {
  loginSection.classList.add('hidden')
  loggedinSection.classList.remove('hidden')
  userEmailEl.textContent = email
}

function showError(message) {
  loginError.textContent = message
  loginError.classList.remove('hidden')
}

function hideError() {
  loginError.classList.add('hidden')
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideError()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  if (!email || !password) {
    showError('Please enter your email and password.')
    return
  }

  loginBtn.disabled = true
  loginBtn.textContent = 'Logging in...'

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/extension-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store credentials
    await chrome.storage.local.set({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user_email: data.user?.email || email,
      user_id: data.user?.id || '',
    })

    showLoggedIn(data.user?.email || email)
  } catch (err) {
    showError(err.message || 'Login failed. Please try again.')
  } finally {
    loginBtn.disabled = false
    loginBtn.textContent = 'Log In'
  }
})

// Open app button
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` })
})

// Logout button
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove([
    'access_token',
    'refresh_token',
    'user_email',
    'user_id',
  ])
  showLogin()
})

// Initialize
checkAuth()
