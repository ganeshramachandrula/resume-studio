import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, __clearRateLimitStore } from '@/lib/security/rate-limit'

describe('Rate Limiter Performance', () => {
  beforeEach(() => {
    __clearRateLimitStore()
  })

  it('completes 10,000 rate limit checks in under 1 second', () => {
    const config = { maxRequests: 100, windowSeconds: 60 }
    const start = performance.now()

    for (let i = 0; i < 10_000; i++) {
      checkRateLimit(`perf-test-ip-${i % 1000}`, config)
    }

    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(1000)
  })

  it('correctly tracks multiple identifiers simultaneously', () => {
    const config = { maxRequests: 3, windowSeconds: 60 }

    // Fill up identifier A
    expect(checkRateLimit('user-A', config).allowed).toBe(true)
    expect(checkRateLimit('user-A', config).allowed).toBe(true)
    expect(checkRateLimit('user-A', config).allowed).toBe(true)
    expect(checkRateLimit('user-A', config).allowed).toBe(false)

    // Identifier B should still be allowed
    expect(checkRateLimit('user-B', config).allowed).toBe(true)
    expect(checkRateLimit('user-B', config).allowed).toBe(true)
    expect(checkRateLimit('user-B', config).allowed).toBe(true)
    expect(checkRateLimit('user-B', config).allowed).toBe(false)

    // Identifier C should also work independently
    expect(checkRateLimit('user-C', config).allowed).toBe(true)
  })

  it('sliding window works: old entries expire and new ones are allowed', async () => {
    // Use a 1-second window for quick testing
    const config = { maxRequests: 2, windowSeconds: 1 }

    expect(checkRateLimit('window-test', config).allowed).toBe(true)
    expect(checkRateLimit('window-test', config).allowed).toBe(true)
    expect(checkRateLimit('window-test', config).allowed).toBe(false)

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 1100))

    // Should be allowed again after window expires
    expect(checkRateLimit('window-test', config).allowed).toBe(true)
  })

  it('returns retryAfterSeconds when rate limited', () => {
    const config = { maxRequests: 1, windowSeconds: 30 }

    expect(checkRateLimit('retry-test', config).allowed).toBe(true)
    const result = checkRateLimit('retry-test', config)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeDefined()
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(30)
  })
})
