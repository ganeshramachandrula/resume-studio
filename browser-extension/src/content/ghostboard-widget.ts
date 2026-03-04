import { getAuthToken } from '@shared/storage'
import { getCompanyRating, rateCompany } from '@shared/api-client'
import { companySlug } from '@shared/normalize'
import type { JobMeta } from '@shared/types'

const WIDGET_ID = 'resume-studio-ghostboard-widget'

function starDisplay(rating: number): string {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function createWidgetHTML(
  avgRating: number | null,
  totalRatings: number,
  isLoggedIn: boolean
): string {
  const hasRating = avgRating !== null && totalRatings > 0

  return `
    <style>
      :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .gb-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px;
        cursor: pointer; transition: all 0.2s; }
      .gb-badge:hover { background: #f1f5f9; border-color: #cbd5e1; }
      .gb-stars { color: #f59e0b; letter-spacing: 1px; }
      .gb-count { color: #64748b; font-size: 12px; }
      .gb-label { color: #1a1a2e; font-weight: 500; font-size: 12px; }
      .gb-form { display: none; margin-top: 8px; padding: 12px; background: #ffffff;
        border: 1px solid #e2e8f0; border-radius: 8px; }
      .gb-form.open { display: block; }
      .gb-form-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #1a1a2e; }
      .gb-star-input { display: flex; gap: 4px; margin-bottom: 8px; }
      .gb-star-btn { background: none; border: none; font-size: 20px; cursor: pointer;
        color: #d1d5db; transition: color 0.15s; padding: 0; line-height: 1; }
      .gb-star-btn.active, .gb-star-btn:hover { color: #f59e0b; }
      .gb-submit { padding: 6px 14px; background: #1A56DB; color: white; border: none;
        border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
      .gb-submit:hover { background: #1E40AF; }
      .gb-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .gb-msg { font-size: 12px; margin-top: 6px; }
      .gb-msg.error { color: #ef4444; }
      .gb-msg.success { color: #10B981; }
      .gb-no-rating { color: #94a3b8; font-size: 12px; }
      .gb-login-hint { color: #64748b; font-size: 11px; margin-top: 4px; }
    </style>
    <div class="gb-badge" id="gb-toggle">
      <span class="gb-label">GhostBoard</span>
      ${hasRating
        ? `<span class="gb-stars">${starDisplay(avgRating!)}</span>
           <span class="gb-count">${avgRating!.toFixed(1)} (${totalRatings})</span>`
        : `<span class="gb-no-rating">No ratings yet</span>`
      }
    </div>
    <div class="gb-form" id="gb-form">
      <div class="gb-form-title">Rate this company</div>
      ${isLoggedIn
        ? `<div class="gb-star-input" id="gb-stars">
             ${[1, 2, 3, 4, 5].map((n) => `<button class="gb-star-btn" data-value="${n}">☆</button>`).join('')}
           </div>
           <button class="gb-submit" id="gb-submit" disabled>Submit Rating</button>
           <div class="gb-msg" id="gb-msg"></div>`
        : `<div class="gb-login-hint">Log in via the extension popup to rate companies.</div>`
      }
    </div>
  `
}

export async function createGhostboardWidget(meta: JobMeta): Promise<HTMLElement | null> {
  if (!meta.company) return null
  if (document.getElementById(WIDGET_ID)) return null

  const slug = companySlug(meta.company)
  if (!slug) return null

  const isLoggedIn = !!(await getAuthToken())
  let rating = await getCompanyRating(slug)

  const host = document.createElement('div')
  host.id = WIDGET_ID
  host.style.cssText = 'position:fixed;bottom:130px;right:24px;z-index:999998;'

  const shadow = host.attachShadow({ mode: 'closed' })
  shadow.innerHTML = createWidgetHTML(
    rating?.avg_overall ?? null,
    rating?.total_ratings ?? 0,
    isLoggedIn
  )

  // Toggle form
  const toggle = shadow.getElementById('gb-toggle')
  const form = shadow.getElementById('gb-form')
  toggle?.addEventListener('click', () => form?.classList.toggle('open'))

  if (isLoggedIn) {
    let selectedRating = 0
    const starBtns = shadow.querySelectorAll('.gb-star-btn')
    const submitBtn = shadow.getElementById('gb-submit') as HTMLButtonElement | null
    const msgEl = shadow.getElementById('gb-msg')

    starBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt((btn as HTMLElement).dataset.value || '0')
        starBtns.forEach((b, i) => {
          b.textContent = i < selectedRating ? '★' : '☆'
          b.classList.toggle('active', i < selectedRating)
        })
        if (submitBtn) submitBtn.disabled = false
      })
    })

    submitBtn?.addEventListener('click', async () => {
      if (!selectedRating || !submitBtn) return
      submitBtn.disabled = true
      submitBtn.textContent = 'Submitting...'
      try {
        await rateCompany({
          company_name: meta.company!,
          overall_recommendation: selectedRating,
        })
        if (msgEl) {
          msgEl.textContent = 'Rating submitted!'
          msgEl.className = 'gb-msg success'
        }
        // Refresh rating display
        rating = await getCompanyRating(slug)
        const badge = shadow.getElementById('gb-toggle')
        if (badge && rating) {
          const starsEl = badge.querySelector('.gb-stars')
          const countEl = badge.querySelector('.gb-count')
          const noRating = badge.querySelector('.gb-no-rating')
          if (noRating) noRating.remove()
          if (starsEl) starsEl.textContent = starDisplay(rating.avg_overall)
          else {
            const s = document.createElement('span')
            s.className = 'gb-stars'
            s.textContent = starDisplay(rating.avg_overall)
            badge.appendChild(s)
          }
          if (countEl) countEl.textContent = `${rating.avg_overall.toFixed(1)} (${rating.total_ratings})`
          else {
            const c = document.createElement('span')
            c.className = 'gb-count'
            c.textContent = `${rating.avg_overall.toFixed(1)} (${rating.total_ratings})`
            badge.appendChild(c)
          }
        }
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = (err as Error).message || 'Error submitting'
          msgEl.className = 'gb-msg error'
        }
      } finally {
        submitBtn.textContent = 'Submit Rating'
      }
    })
  }

  return host
}

export function removeGhostboardWidget() {
  document.getElementById(WIDGET_ID)?.remove()
}
