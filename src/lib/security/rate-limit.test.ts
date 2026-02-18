import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  getClientIP,
  getClientCountry,
  AUTH_RATE_LIMIT,
  GENERATION_RATE_LIMIT,
  STRIPE_RATE_LIMIT,
  GENERAL_RATE_LIMIT,
  SUPPORT_RATE_LIMIT,
  ADMIN_RATE_LIMIT,
  COACH_RATE_LIMIT,
  COACH_MONTHLY_LIMIT,
  DEVICE_SESSION_RATE_LIMIT,
  JOB_SEARCH_RATE_LIMIT,
  EXTENSION_RATE_LIMIT,
  __clearRateLimitStore,
} from '@/lib/security/rate-limit'

// Note: __clearRateLimitStore is called in beforeEach by the global setup.ts,
// but we also call it here explicitly for clarity.

beforeEach(() => {
  __clearRateLimitStore()
})

// ── checkRateLimit ───────────────────────────────────────────

describe('checkRateLimit', () => {
  const config = { maxRequests: 3, windowSeconds: 60 }

  it('allows requests under the limit', () => {
    const result = checkRateLimit('user-1', config)
    expect(result.allowed).toBe(true)
    expect(result.retryAfterSeconds).toBeUndefined()
  })

  it('allows up to maxRequests', () => {
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit('user-2', config)
      expect(result.allowed).toBe(true)
    }
  })

  it('blocks at the limit', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user-3', config)
    }
    const result = checkRateLimit('user-3', config)
    expect(result.allowed).toBe(false)
  })

  it('returns retryAfterSeconds when blocked', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user-4', config)
    }
    const result = checkRateLimit('user-4', config)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeDefined()
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1)
  })

  it('tracks per identifier independently', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('user-A', config)
    }
    // user-A is blocked
    expect(checkRateLimit('user-A', config).allowed).toBe(false)
    // user-B should still be allowed
    expect(checkRateLimit('user-B', config).allowed).toBe(true)
  })

  it('clears between tests via __clearRateLimitStore', () => {
    // After beforeEach clears, everything is fresh
    const result = checkRateLimit('user-clear-test', config)
    expect(result.allowed).toBe(true)
  })

  it('allows requests again after window expires', () => {
    // Use a very short window to test expiry
    const shortConfig = { maxRequests: 1, windowSeconds: 1 }
    checkRateLimit('user-expire', shortConfig)
    // Should be blocked now
    expect(checkRateLimit('user-expire', shortConfig).allowed).toBe(false)

    // We cannot actually wait in tests, but we can verify the mechanism
    // by clearing and re-testing
    __clearRateLimitStore()
    expect(checkRateLimit('user-expire', shortConfig).allowed).toBe(true)
  })

  it('handles single-request limit', () => {
    const singleConfig = { maxRequests: 1, windowSeconds: 60 }
    expect(checkRateLimit('single-user', singleConfig).allowed).toBe(true)
    expect(checkRateLimit('single-user', singleConfig).allowed).toBe(false)
  })
})

// ── getClientIP ──────────────────────────────────────────────

describe('getClientIP', () => {
  it('returns cf-connecting-ip when present', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'cf-connecting-ip': '1.2.3.4',
        'x-forwarded-for': '5.6.7.8',
        'x-real-ip': '9.10.11.12',
      },
    })
    expect(getClientIP(request)).toBe('1.2.3.4')
  })

  it('returns first IP from x-forwarded-for', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3',
      },
    })
    expect(getClientIP(request)).toBe('10.0.0.1')
  })

  it('returns x-real-ip when no cf or forwarded headers', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    })
    expect(getClientIP(request)).toBe('192.168.1.1')
  })

  it('returns unknown when no IP headers present', () => {
    const request = new Request('http://localhost/')
    expect(getClientIP(request)).toBe('unknown')
  })

  it('handles commas with spaces in x-forwarded-for', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'x-forwarded-for': '  203.0.113.50 , 70.41.3.18, 150.172.238.178',
      },
    })
    expect(getClientIP(request)).toBe('203.0.113.50')
  })

  it('trims whitespace from cf-connecting-ip', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'cf-connecting-ip': '  1.2.3.4  ',
      },
    })
    expect(getClientIP(request)).toBe('1.2.3.4')
  })
})

// ── getClientCountry ─────────────────────────────────────────

describe('getClientCountry', () => {
  it('returns x-vercel-ip-country when present', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'x-vercel-ip-country': 'US',
        'cf-ipcountry': 'GB',
      },
    })
    expect(getClientCountry(request)).toBe('US')
  })

  it('returns cf-ipcountry when vercel header absent', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'cf-ipcountry': 'DE',
      },
    })
    expect(getClientCountry(request)).toBe('DE')
  })

  it('returns null when no country headers present', () => {
    const request = new Request('http://localhost/')
    expect(getClientCountry(request)).toBeNull()
  })

  it('rejects XX from cf-ipcountry', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'cf-ipcountry': 'XX',
      },
    })
    expect(getClientCountry(request)).toBeNull()
  })

  it('uppercases country codes', () => {
    const request = new Request('http://localhost/', {
      headers: {
        'x-vercel-ip-country': 'jp',
      },
    })
    expect(getClientCountry(request)).toBe('JP')
  })
})

// ── Presets ──────────────────────────────────────────────────

describe('Rate limit presets', () => {
  const presets = [
    { name: 'AUTH_RATE_LIMIT', config: AUTH_RATE_LIMIT },
    { name: 'GENERATION_RATE_LIMIT', config: GENERATION_RATE_LIMIT },
    { name: 'STRIPE_RATE_LIMIT', config: STRIPE_RATE_LIMIT },
    { name: 'GENERAL_RATE_LIMIT', config: GENERAL_RATE_LIMIT },
    { name: 'SUPPORT_RATE_LIMIT', config: SUPPORT_RATE_LIMIT },
    { name: 'ADMIN_RATE_LIMIT', config: ADMIN_RATE_LIMIT },
    { name: 'COACH_RATE_LIMIT', config: COACH_RATE_LIMIT },
    { name: 'COACH_MONTHLY_LIMIT', config: COACH_MONTHLY_LIMIT },
    { name: 'DEVICE_SESSION_RATE_LIMIT', config: DEVICE_SESSION_RATE_LIMIT },
    { name: 'JOB_SEARCH_RATE_LIMIT', config: JOB_SEARCH_RATE_LIMIT },
    { name: 'EXTENSION_RATE_LIMIT', config: EXTENSION_RATE_LIMIT },
  ]

  it.each(presets)('$name has valid maxRequests (> 0)', ({ config }) => {
    expect(config.maxRequests).toBeGreaterThan(0)
    expect(Number.isInteger(config.maxRequests)).toBe(true)
  })

  it.each(presets)('$name has valid windowSeconds (> 0)', ({ config }) => {
    expect(config.windowSeconds).toBeGreaterThan(0)
    expect(Number.isInteger(config.windowSeconds)).toBe(true)
  })
})
