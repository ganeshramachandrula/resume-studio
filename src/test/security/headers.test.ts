import { describe, it, expect, beforeAll } from 'vitest'
import nextConfig from '../../../next.config'

describe('Security Headers - next.config.ts', () => {
  let headers: Array<{ key: string; value: string }>

  // Extract headers from the config
  beforeAll(async () => {
    if (!nextConfig.headers) {
      throw new Error('next.config.ts does not define a headers() function')
    }
    const result = await nextConfig.headers()
    // Find the catch-all source pattern
    const catchAll = result.find((h) => h.source === '/(.*)')
    if (!catchAll) {
      throw new Error('No catch-all header rule found in next.config.ts')
    }
    headers = catchAll.headers
  })

  function getHeader(name: string): string | undefined {
    return headers.find((h) => h.key === name)?.value
  }

  it('sets X-Frame-Options to DENY', () => {
    expect(getHeader('X-Frame-Options')).toBe('DENY')
  })

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(getHeader('X-Content-Type-Options')).toBe('nosniff')
  })

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(getHeader('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('CSP contains script-src directive', () => {
    const csp = getHeader('Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp).toContain('script-src')
  })

  it('CSP contains style-src directive', () => {
    const csp = getHeader('Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp).toContain('style-src')
  })

  it('CSP contains connect-src with google-analytics.com', () => {
    const csp = getHeader('Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp).toContain('connect-src')
    expect(csp).toContain('google-analytics.com')
  })

  it('CSP contains frame-src, object-src none, and base-uri self', () => {
    const csp = getHeader('Content-Security-Policy')
    expect(csp).toBeDefined()
    expect(csp).toContain('frame-src')
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
  })

  it('Permissions-Policy blocks camera, microphone, and geolocation', () => {
    const pp = getHeader('Permissions-Policy')
    expect(pp).toBeDefined()
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
    expect(pp).toContain('geolocation=()')
  })
})
