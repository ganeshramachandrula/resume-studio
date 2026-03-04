import { describe, it, expect } from 'vitest'
import { normalizeCompanyName, companySlug, displayCompanyName } from './normalize'

describe('normalizeCompanyName', () => {
  it('lowercases and trims', () => {
    expect(normalizeCompanyName('  Google  ')).toBe('google')
  })

  it('strips legal suffixes', () => {
    expect(normalizeCompanyName('Google Inc.')).toBe('google')
    expect(normalizeCompanyName('Google LLC')).toBe('google')
    expect(normalizeCompanyName('Google Ltd')).toBe('google')
    expect(normalizeCompanyName('Google Corp')).toBe('google')
    expect(normalizeCompanyName('Google Corporation')).toBe('google')
    expect(normalizeCompanyName('Google GmbH')).toBe('google')
    expect(normalizeCompanyName('Google PLC')).toBe('google')
  })

  it('collapses whitespace', () => {
    expect(normalizeCompanyName('Meta   Platforms')).toBe('meta platforms')
  })

  it('handles already clean names', () => {
    expect(normalizeCompanyName('stripe')).toBe('stripe')
  })

  it('maps variations to the same name', () => {
    const variants = ['Google', 'google', 'GOOGLE', 'Google Inc.', 'Google LLC', 'google inc']
    const results = variants.map(normalizeCompanyName)
    expect(new Set(results).size).toBe(1)
  })
})

describe('companySlug', () => {
  it('generates URL-safe slug', () => {
    expect(companySlug('Google Inc.')).toBe('google')
    expect(companySlug('Meta Platforms')).toBe('meta-platforms')
    expect(companySlug('JPMorgan Chase & Co.')).toBe('jpmorgan-chase')
  })

  it('handles special characters', () => {
    expect(companySlug('AT&T')).toBe('att')
    expect(companySlug('Procter & Gamble')).toBe('procter-gamble')
  })

  it('removes leading/trailing hyphens', () => {
    expect(companySlug('--test--')).toBe('test')
  })
})

describe('displayCompanyName', () => {
  it('capitalizes words', () => {
    expect(displayCompanyName('google inc.')).toBe('Google')
    expect(displayCompanyName('meta platforms')).toBe('Meta Platforms')
  })
})
