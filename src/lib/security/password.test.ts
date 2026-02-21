import { describe, it, expect } from 'vitest'
import { validatePassword, isPasswordExpired, MIN_PASSWORD_LENGTH, PASSWORD_EXPIRY_DAYS } from './password'

describe('validatePassword', () => {
  it('rejects password shorter than minimum length', () => {
    const result = validatePassword('Short1!')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain(`${MIN_PASSWORD_LENGTH}`)
  })

  it('rejects password without uppercase letter', () => {
    const result = validatePassword('alllowercase1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('uppercase'))
  })

  it('rejects password without lowercase letter', () => {
    const result = validatePassword('ALLUPPERCASE1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('lowercase'))
  })

  it('rejects password without digit', () => {
    const result = validatePassword('NoDigitsHere!!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('digit'))
  })

  it('rejects password without special character', () => {
    const result = validatePassword('NoSpecials123A')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('special'))
  })

  it('accepts a valid complex password', () => {
    const result = validatePassword('MyStr0ng!Pass9')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepts a 16-character complex password', () => {
    const result = validatePassword('Xk9#mR2$pL5@wN7!')
    expect(result.valid).toBe(true)
  })

  it('returns multiple errors for very weak password', () => {
    const result = validatePassword('abc')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

describe('isPasswordExpired', () => {
  it('returns true when password_changed_at is null', () => {
    expect(isPasswordExpired(null)).toBe(true)
  })

  it('returns true when password was changed more than 90 days ago', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - (PASSWORD_EXPIRY_DAYS + 1))
    expect(isPasswordExpired(oldDate.toISOString())).toBe(true)
  })

  it('returns false when password was changed recently', () => {
    const recent = new Date()
    recent.setDate(recent.getDate() - 10)
    expect(isPasswordExpired(recent.toISOString())).toBe(false)
  })

  it('returns false when password was changed today', () => {
    expect(isPasswordExpired(new Date().toISOString())).toBe(false)
  })

  it('returns true at exactly 90 days boundary', () => {
    const boundary = new Date()
    boundary.setDate(boundary.getDate() - PASSWORD_EXPIRY_DAYS)
    boundary.setHours(boundary.getHours() - 1) // Just past the boundary
    expect(isPasswordExpired(boundary.toISOString())).toBe(true)
  })
})
