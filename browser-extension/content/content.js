// Resume Studio Content Script
// Injects a floating "Generate Resume" button on job listing pages.

(function () {
  'use strict'

  const API_BASE_URL = 'http://localhost:5000'
  const BUTTON_ID = 'resume-studio-generate-btn'

  // Determine which site we're on and extract JD accordingly
  function detectSite() {
    const host = window.location.hostname
    if (host.includes('indeed.com')) return 'indeed'
    if (host.includes('linkedin.com')) return 'linkedin'
    if (host.includes('monster.com')) return 'monster'
    if (host.includes('glassdoor.com')) return 'glassdoor'
    if (host.includes('dice.com')) return 'dice'
    if (host.includes('ziprecruiter.com')) return 'ziprecruiter'
    return 'generic'
  }

  function extractJD(site) {
    switch (site) {
      case 'indeed': {
        const el = document.getElementById('jobDescriptionText') ||
          document.querySelector('.jobsearch-jobDescriptionText') ||
          document.querySelector('[data-testid="jobDescriptionText"]')
        return el ? el.innerText.trim() : null
      }
      case 'linkedin': {
        const el = document.querySelector('.description__text') ||
          document.querySelector('.jobs-description__content') ||
          document.querySelector('.jobs-box__html-content')
        return el ? el.innerText.trim() : null
      }
      case 'monster': {
        const el = document.querySelector('.job-description') ||
          document.querySelector('[data-testid="svx-jobview-description"]')
        return el ? el.innerText.trim() : null
      }
      case 'glassdoor': {
        const el = document.querySelector('.jobDescriptionContent') ||
          document.querySelector('[data-test="jobDescriptionContent"]')
        return el ? el.innerText.trim() : null
      }
      case 'dice': {
        const el = document.querySelector('[data-testid="jobDescriptionHtml"]') ||
          document.querySelector('.job-description')
        return el ? el.innerText.trim() : null
      }
      case 'ziprecruiter': {
        const el = document.querySelector('.job_description') ||
          document.querySelector('.jobDescriptionSection')
        return el ? el.innerText.trim() : null
      }
      default: {
        // Generic fallback
        const selectors = [
          '.job-description', '.job_description', '#job-description',
          '[class*="jobDescription"]', '[class*="job-description"]',
        ]
        for (const sel of selectors) {
          const el = document.querySelector(sel)
          if (el && el.innerText.trim().length > 100) return el.innerText.trim()
        }
        // Try longest text in article/main
        const containers = document.querySelectorAll('article, main, [role="main"]')
        let longest = ''
        for (const c of containers) {
          const t = c.innerText.trim()
          if (t.length > longest.length) longest = t
        }
        return longest.length > 200 ? longest : null
      }
    }
  }

  async function getAuthToken() {
    const result = await chrome.storage.local.get(['access_token'])
    return result.access_token || null
  }

  function createButton() {
    if (document.getElementById(BUTTON_ID)) return

    const btn = document.createElement('button')
    btn.id = BUTTON_ID
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      Generate Resume with Resume Studio
    `
    btn.addEventListener('click', handleClick)
    document.body.appendChild(btn)
  }

  function updateButtonState(text, disabled, isError) {
    const btn = document.getElementById(BUTTON_ID)
    if (!btn) return
    btn.innerHTML = text
    btn.disabled = disabled
    if (isError) {
      btn.style.background = '#ef4444'
      setTimeout(() => {
        btn.style.background = ''
        resetButton()
      }, 3000)
    }
  }

  function resetButton() {
    const btn = document.getElementById(BUTTON_ID)
    if (!btn) return
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      Generate Resume with Resume Studio
    `
    btn.disabled = false
  }

  async function handleClick() {
    const token = await getAuthToken()
    if (!token) {
      updateButtonState('Please log in via the extension popup first', true, true)
      return
    }

    const site = detectSite()
    const jdText = extractJD(site)

    if (!jdText || jdText.length < 50) {
      updateButtonState('Could not extract job description', true, true)
      return
    }

    updateButtonState('Sending to Resume Studio...', true, false)

    try {
      const res = await fetch(`${API_BASE_URL}/api/extension/submit-jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raw_text: jdText,
          source_url: window.location.href,
          source_site: site,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      // Open Resume Studio generate page
      const url = data.full_url || `${API_BASE_URL}${data.redirect_url}`
      window.open(url, '_blank')

      updateButtonState('Sent! Opening Resume Studio...', true, false)
      setTimeout(resetButton, 2000)
    } catch (err) {
      updateButtonState(err.message || 'Error submitting', true, true)
    }
  }

  // Wait a bit for dynamic content to load, then inject
  function init() {
    // Only create button if we can find a JD on the page
    const site = detectSite()
    const jd = extractJD(site)
    if (jd && jd.length >= 50) {
      createButton()
    } else {
      // Retry after a delay for SPAs
      setTimeout(() => {
        const jdRetry = extractJD(site)
        if (jdRetry && jdRetry.length >= 50) {
          createButton()
        }
      }, 3000)
    }
  }

  // Run after page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
