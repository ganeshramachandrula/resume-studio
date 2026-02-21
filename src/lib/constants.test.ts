import { describe, it, expect } from 'vitest'
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_PROVIDERS,
  JOB_PROVIDER_LABELS,
  SUPPORT_CATEGORIES,
  COLORS,
} from '@/lib/constants'

describe('DOCUMENT_TYPES', () => {
  it('has exactly 8 entries', () => {
    expect(DOCUMENT_TYPES).toHaveLength(8)
  })

  it('every DOCUMENT_TYPE has a label in DOCUMENT_TYPE_LABELS', () => {
    for (const type of DOCUMENT_TYPES) {
      expect(DOCUMENT_TYPE_LABELS[type]).toBeDefined()
      expect(typeof DOCUMENT_TYPE_LABELS[type]).toBe('string')
      expect(DOCUMENT_TYPE_LABELS[type].length).toBeGreaterThan(0)
    }
  })
})

describe('JOB_STATUSES', () => {
  it('every JOB_STATUS has a label in JOB_STATUS_LABELS', () => {
    for (const status of JOB_STATUSES) {
      expect(JOB_STATUS_LABELS[status]).toBeDefined()
      expect(typeof JOB_STATUS_LABELS[status]).toBe('string')
      expect(JOB_STATUS_LABELS[status].length).toBeGreaterThan(0)
    }
  })
})

describe('JOB_PROVIDERS', () => {
  it('every JOB_PROVIDER has a label in JOB_PROVIDER_LABELS', () => {
    for (const provider of JOB_PROVIDERS) {
      expect(JOB_PROVIDER_LABELS[provider]).toBeDefined()
      expect(typeof JOB_PROVIDER_LABELS[provider]).toBe('string')
      expect(JOB_PROVIDER_LABELS[provider].length).toBeGreaterThan(0)
    }
  })
})

describe('SUPPORT_CATEGORIES', () => {
  it('has entries', () => {
    expect(SUPPORT_CATEGORIES.length).toBeGreaterThan(0)
  })
})

describe('COLORS', () => {
  it('has brand, accent, and dark keys', () => {
    expect(COLORS.brand).toBeDefined()
    expect(COLORS.accent).toBeDefined()
    expect(COLORS.dark).toBeDefined()
  })

  it('all color values are valid hex strings', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    expect(COLORS.brand).toMatch(hexRegex)
    expect(COLORS.accent).toMatch(hexRegex)
    expect(COLORS.dark).toMatch(hexRegex)
  })
})
