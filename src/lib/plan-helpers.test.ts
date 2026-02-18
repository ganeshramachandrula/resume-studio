import { describe, it, expect } from 'vitest'
import { isPro, isAnnual, hasCredits, canSave } from '@/lib/plan-helpers'
import { createProfile } from '@/test/helpers'

// ── isPro ────────────────────────────────────────────────────

describe('isPro', () => {
  it('returns false for free plan', () => {
    expect(isPro(createProfile({ plan: 'free' }))).toBe(false)
  })

  it('returns true for pro_monthly plan', () => {
    expect(isPro(createProfile({ plan: 'pro_monthly' }))).toBe(true)
  })

  it('returns true for pro_annual plan', () => {
    expect(isPro(createProfile({ plan: 'pro_annual' }))).toBe(true)
  })

  it('returns true for team plan', () => {
    expect(isPro(createProfile({ plan: 'team' }))).toBe(true)
  })

  it('returns false for null profile', () => {
    expect(isPro(null)).toBe(false)
  })
})

// ── isAnnual ─────────────────────────────────────────────────

describe('isAnnual', () => {
  it('returns false for free plan', () => {
    expect(isAnnual(createProfile({ plan: 'free' }))).toBe(false)
  })

  it('returns false for pro_monthly plan', () => {
    expect(isAnnual(createProfile({ plan: 'pro_monthly' }))).toBe(false)
  })

  it('returns true for pro_annual plan', () => {
    expect(isAnnual(createProfile({ plan: 'pro_annual' }))).toBe(true)
  })

  it('returns true for team plan', () => {
    expect(isAnnual(createProfile({ plan: 'team' }))).toBe(true)
  })

  it('returns false for null profile', () => {
    expect(isAnnual(null)).toBe(false)
  })
})

// ── hasCredits ───────────────────────────────────────────────

describe('hasCredits', () => {
  it('returns false when credits is 0', () => {
    expect(hasCredits(createProfile({ credits: 0 }))).toBe(false)
  })

  it('returns true when credits is positive', () => {
    expect(hasCredits(createProfile({ credits: 3 }))).toBe(true)
  })

  it('returns false for null profile', () => {
    expect(hasCredits(null)).toBe(false)
  })
})

// ── canSave ──────────────────────────────────────────────────

describe('canSave', () => {
  it('returns false for free user with no credits', () => {
    expect(canSave(createProfile({ plan: 'free', credits: 0 }))).toBe(false)
  })

  it('returns true for free user with credits', () => {
    expect(canSave(createProfile({ plan: 'free', credits: 1 }))).toBe(true)
  })

  it('returns true for pro_monthly user', () => {
    expect(canSave(createProfile({ plan: 'pro_monthly' }))).toBe(true)
  })

  it('returns true for pro_annual user', () => {
    expect(canSave(createProfile({ plan: 'pro_annual' }))).toBe(true)
  })

  it('returns true for team user', () => {
    expect(canSave(createProfile({ plan: 'team' }))).toBe(true)
  })

  it('returns false for null profile', () => {
    expect(canSave(null)).toBe(false)
  })
})
