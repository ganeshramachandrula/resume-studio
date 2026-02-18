import { describe, it, expect } from 'vitest'
import { isValidRedirect } from '@/lib/security/sanitize'

describe('Open Redirect Prevention - isValidRedirect', () => {
  it('rejects absolute URL to external site (https://evil.com)', () => {
    expect(isValidRedirect('https://evil.com')).toBe(false)
  })

  it('rejects protocol-relative URL (//evil.com)', () => {
    expect(isValidRedirect('//evil.com')).toBe(false)
  })

  it('accepts /dashboard as a valid redirect', () => {
    expect(isValidRedirect('/dashboard')).toBe(true)
  })

  it('rejects unlisted path (/evil-path)', () => {
    expect(isValidRedirect('/evil-path')).toBe(false)
  })

  it('rejects javascript: protocol even without leading slash', () => {
    expect(isValidRedirect('javascript:alert(1)')).toBe(false)
  })

  it('accepts /admin/users as an allowed path', () => {
    expect(isValidRedirect('/admin/users')).toBe(true)
  })

  it('accepts /dashboard/../settings because it starts with /dashboard/', () => {
    // The path starts with /dashboard/ which is an allowed prefix
    expect(isValidRedirect('/dashboard/../settings')).toBe(true)
  })

  it('accepts /career-coach as a valid redirect', () => {
    expect(isValidRedirect('/career-coach')).toBe(true)
  })
})
