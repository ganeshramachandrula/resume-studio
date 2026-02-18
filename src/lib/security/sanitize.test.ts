import { describe, it, expect } from 'vitest'
import {
  stripHtml,
  truncate,
  isEmailVerified,
  isValidRedirect,
  safeErrorResponse,
} from '@/lib/security/sanitize'

// ── stripHtml ────────────────────────────────────────────────

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world')
  })

  it('removes self-closing tags', () => {
    expect(stripHtml('before<br/>after')).toBe('beforeafter')
  })

  it('removes javascript: protocol', () => {
    expect(stripHtml('javascript:alert(1)')).toBe('alert(1)')
  })

  it('removes javascript: protocol case-insensitively', () => {
    expect(stripHtml('JAVASCRIPT:alert(1)')).toBe('alert(1)')
  })

  it('removes javascript: with spaces', () => {
    expect(stripHtml('java script :alert(1)')).not.toContain('javascript')
  })

  it('removes event handlers', () => {
    expect(stripHtml('test onclick="alert(1)" rest')).toBe('test  rest')
  })

  it('removes onmouseover event handler', () => {
    expect(stripHtml('text onmouseover="doEvil()" more')).toBe('text  more')
  })

  it('removes data:text/html', () => {
    expect(stripHtml('data:text/html,<script>alert(1)</script>')).toBe(',alert(1)')
  })

  it('trims whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here')
  })

  // Entity bypass tests
  it('sanitizes javascript&#58; entity bypass', () => {
    const result = stripHtml('javascript&#58;alert(1)')
    expect(result).not.toContain('javascript&#58;')
    // The regex removes the entire javascript + entity-encoded colon pattern
  })

  it('sanitizes javascript&#x3a; hex entity bypass', () => {
    const result = stripHtml('javascript&#x3a;alert(1)')
    expect(result).not.toContain('javascript&#x3a;')
  })

  it('sanitizes spaced javascript with entity colon', () => {
    const result = stripHtml('j a v a s c r i p t &#58;alert(1)')
    expect(result).not.toContain('&#58;')
  })

  it('removes encoded j character bypass (&#x6a;)', () => {
    const result = stripHtml('&#x6a;avascript:alert(1)')
    // Should strip the encoded j character
    expect(result).not.toContain('&#x6a;')
  })
})

// ── truncate ─────────────────────────────────────────────────

describe('truncate', () => {
  it('returns string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns string unchanged when at exact limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates string when beyond limit', () => {
    expect(truncate('hello world', 5)).toBe('hello')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles limit of 0', () => {
    expect(truncate('hello', 0)).toBe('')
  })
})

// ── isEmailVerified ──────────────────────────────────────────

describe('isEmailVerified', () => {
  it('returns true when email_confirmed_at is a timestamp', () => {
    expect(isEmailVerified({ email_confirmed_at: '2024-01-01T00:00:00Z' })).toBe(true)
  })

  it('returns false when email_confirmed_at is null', () => {
    expect(isEmailVerified({ email_confirmed_at: null })).toBe(false)
  })

  it('returns false when email_confirmed_at is undefined', () => {
    expect(isEmailVerified({})).toBe(false)
  })

  it('returns true for any truthy string', () => {
    expect(isEmailVerified({ email_confirmed_at: 'any-string' })).toBe(true)
  })
})

// ── isValidRedirect ──────────────────────────────────────────

describe('isValidRedirect', () => {
  it('accepts /dashboard', () => {
    expect(isValidRedirect('/dashboard')).toBe(true)
  })

  it('accepts /admin/users', () => {
    expect(isValidRedirect('/admin/users')).toBe(true)
  })

  it('accepts /job-feed/preferences', () => {
    expect(isValidRedirect('/job-feed/preferences')).toBe(true)
  })

  it('accepts /career-coach', () => {
    expect(isValidRedirect('/career-coach')).toBe(true)
  })

  it('accepts /team', () => {
    expect(isValidRedirect('/team')).toBe(true)
  })

  it('accepts sub-paths of allowed paths', () => {
    expect(isValidRedirect('/admin/users/123')).toBe(true)
  })

  it('rejects paths with protocol', () => {
    expect(isValidRedirect('https://evil.com/dashboard')).toBe(false)
  })

  it('rejects paths starting with //', () => {
    expect(isValidRedirect('//evil.com/dashboard')).toBe(false)
  })

  it('rejects paths not starting with /', () => {
    expect(isValidRedirect('dashboard')).toBe(false)
  })

  it('rejects unlisted paths', () => {
    expect(isValidRedirect('/unknown-page')).toBe(false)
  })

  it('rejects /login', () => {
    expect(isValidRedirect('/login')).toBe(false)
  })

  it('rejects javascript: protocol', () => {
    expect(isValidRedirect('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: protocol', () => {
    expect(isValidRedirect('data:text/html,<script>alert(1)</script>')).toBe(false)
  })
})

// ── safeErrorResponse ────────────────────────────────────────

describe('safeErrorResponse', () => {
  it('returns correct status code 400', async () => {
    const response = safeErrorResponse(new Error('db details'), 'test', 400)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Invalid request')
  })

  it('returns correct status code 401', async () => {
    const response = safeErrorResponse(new Error('token invalid'), 'test', 401)
    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns correct status code 403', async () => {
    const response = safeErrorResponse(new Error('forbidden'), 'test', 403)
    expect(response.status).toBe(403)
    const json = await response.json()
    expect(json.error).toBe('Access denied')
  })

  it('returns correct status code 429', async () => {
    const response = safeErrorResponse(new Error('rate limited'), 'test', 429)
    expect(response.status).toBe(429)
    const json = await response.json()
    expect(json.error).toContain('Too many requests')
  })

  it('returns generic 500 message by default', async () => {
    const response = safeErrorResponse(new Error('SQL injection trace'), 'test')
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('An unexpected error occurred. Please try again.')
  })

  it('does not leak error details in response body', async () => {
    const sensitiveError = new Error('Connection to postgres://user:pass@host:5432/db failed')
    const response = safeErrorResponse(sensitiveError, 'db-query', 500)
    const json = await response.json()
    expect(json.error).not.toContain('postgres')
    expect(json.error).not.toContain('pass')
    expect(json.error).not.toContain('Connection')
  })

  it('returns generic message for unknown status codes', async () => {
    const response = safeErrorResponse(new Error('weird'), 'test', 418)
    expect(response.status).toBe(418)
    const json = await response.json()
    expect(json.error).toBe('An unexpected error occurred. Please try again.')
  })
})
