import { describe, it, expect } from 'vitest'
import {
  PRESET_LANGUAGES,
  PDF_UNSUPPORTED_LANGUAGES,
  getLanguageName,
} from '@/lib/templates/languages'

describe('PRESET_LANGUAGES', () => {
  it('has 11 entries', () => {
    expect(PRESET_LANGUAGES).toHaveLength(11)
  })

  it('each language has code, name, nativeName', () => {
    for (const lang of PRESET_LANGUAGES) {
      expect(lang.code, `Language missing code`).toBeDefined()
      expect(lang.name, `Language "${lang.code}" missing name`).toBeDefined()
      expect(lang.nativeName, `Language "${lang.code}" missing nativeName`).toBeDefined()
      expect(typeof lang.code).toBe('string')
      expect(typeof lang.name).toBe('string')
      expect(typeof lang.nativeName).toBe('string')
    }
  })

  it('all codes are unique', () => {
    const codes = PRESET_LANGUAGES.map((l) => l.code)
    const uniqueCodes = new Set(codes)
    expect(uniqueCodes.size).toBe(codes.length)
  })
})

describe('getLanguageName', () => {
  it('returns name for known code ("en" -> "English")', () => {
    expect(getLanguageName('en')).toBe('English')
    expect(getLanguageName('es')).toBe('Spanish')
    expect(getLanguageName('fr')).toBe('French')
  })

  it('returns code itself for unknown code', () => {
    expect(getLanguageName('xx')).toBe('xx')
    expect(getLanguageName('unknown')).toBe('unknown')
  })
})

describe('PDF_UNSUPPORTED_LANGUAGES', () => {
  it('includes zh, ja, ko, ar, hi', () => {
    expect(PDF_UNSUPPORTED_LANGUAGES).toContain('zh')
    expect(PDF_UNSUPPORTED_LANGUAGES).toContain('ja')
    expect(PDF_UNSUPPORTED_LANGUAGES).toContain('ko')
    expect(PDF_UNSUPPORTED_LANGUAGES).toContain('ar')
    expect(PDF_UNSUPPORTED_LANGUAGES).toContain('hi')
  })
})
