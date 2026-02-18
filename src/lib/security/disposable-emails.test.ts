import { describe, it, expect } from 'vitest'
import { isDisposableEmail, normalizeEmail } from '@/lib/security/disposable-emails'

describe('isDisposableEmail', () => {
  it('detects mailinator.com, yopmail.com, guerrillamail.com', () => {
    expect(isDisposableEmail('test@mailinator.com')).toBe(true)
    expect(isDisposableEmail('test@yopmail.com')).toBe(true)
    expect(isDisposableEmail('test@guerrillamail.com')).toBe(true)
  })

  it('allows gmail.com, yahoo.com, outlook.com', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false)
    expect(isDisposableEmail('user@yahoo.com')).toBe(false)
    expect(isDisposableEmail('user@outlook.com')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(isDisposableEmail('test@MAILINATOR.COM')).toBe(true)
    expect(isDisposableEmail('test@Yopmail.Com')).toBe(true)
    expect(isDisposableEmail('test@GMAIL.COM')).toBe(false)
  })

  it('handles missing @ gracefully', () => {
    expect(isDisposableEmail('noatsign')).toBe(false)
    expect(isDisposableEmail('')).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('lowercases the email', () => {
    expect(normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
  })

  it('strips +suffix for all providers', () => {
    expect(normalizeEmail('user+tag@example.com')).toBe('user@example.com')
    expect(normalizeEmail('user+tag@yahoo.com')).toBe('user@yahoo.com')
  })

  it('removes dots for gmail.com', () => {
    expect(normalizeEmail('u.s.e.r@gmail.com')).toBe('user@gmail.com')
  })

  it('removes dots for googlemail.com', () => {
    expect(normalizeEmail('u.s.e.r@googlemail.com')).toBe('user@googlemail.com')
  })

  it('preserves dots for non-gmail providers', () => {
    expect(normalizeEmail('first.last@yahoo.com')).toBe('first.last@yahoo.com')
    expect(normalizeEmail('first.last@outlook.com')).toBe('first.last@outlook.com')
  })
})
