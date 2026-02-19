import { describe, it, expect } from 'vitest'
import {
  COUNTRY_FORMATS,
  getCountryFormat,
  getCountriesByRegion,
  getRegions,
  getFormatSummary,
  type CountryResumeFormat,
} from './resume-formats'

describe('resume-formats', () => {
  describe('COUNTRY_FORMATS dataset', () => {
    it('has exactly 20 countries', () => {
      expect(COUNTRY_FORMATS).toHaveLength(20)
    })

    it('every country has all required fields', () => {
      for (const fmt of COUNTRY_FORMATS) {
        expect(fmt.code).toMatch(/^[A-Z]{2}$/)
        expect(fmt.name).toBeTruthy()
        expect(fmt.region).toBeTruthy()
        expect(fmt.norms.photo).toBeTruthy()
        expect(typeof fmt.norms.date_of_birth).toBe('boolean')
        expect(typeof fmt.norms.nationality).toBe('boolean')
        expect(typeof fmt.norms.marital_status).toBe('boolean')
        expect(['resume', 'cv']).toContain(fmt.norms.preferred_format)
        expect(fmt.norms.section_order.length).toBeGreaterThan(3)
        expect(fmt.norms.language).toBeTruthy()
        expect(fmt.cultural_tips.length).toBeGreaterThanOrEqual(3)
        expect(fmt.interview_culture.length).toBeGreaterThanOrEqual(3)
      }
    })

    it('has unique country codes', () => {
      const codes = COUNTRY_FORMATS.map((f) => f.code)
      expect(new Set(codes).size).toBe(codes.length)
    })

    it('page_limit is a positive number or null', () => {
      for (const fmt of COUNTRY_FORMATS) {
        if (fmt.norms.page_limit !== null) {
          expect(fmt.norms.page_limit).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('getCountryFormat', () => {
    it('returns format for valid code', () => {
      const us = getCountryFormat('US')
      expect(us).toBeDefined()
      expect(us!.name).toBe('United States')
    })

    it('is case-insensitive', () => {
      expect(getCountryFormat('de')?.name).toBe('Germany')
      expect(getCountryFormat('De')?.name).toBe('Germany')
    })

    it('returns undefined for unknown code', () => {
      expect(getCountryFormat('XX')).toBeUndefined()
    })
  })

  describe('getCountriesByRegion', () => {
    it('returns countries for Europe', () => {
      const europe = getCountriesByRegion('Europe')
      expect(europe.length).toBeGreaterThan(5)
      expect(europe.every((f) => f.region === 'Europe')).toBe(true)
    })

    it('returns empty array for unknown region', () => {
      expect(getCountriesByRegion('Antarctica')).toHaveLength(0)
    })
  })

  describe('getRegions', () => {
    it('returns unique regions', () => {
      const regions = getRegions()
      expect(regions.length).toBeGreaterThanOrEqual(4)
      expect(new Set(regions).size).toBe(regions.length)
    })
  })

  describe('getFormatSummary', () => {
    it('returns a readable summary for US', () => {
      const summary = getFormatSummary('US')
      expect(summary).toContain('United States')
      expect(summary).toContain('resume')
      expect(summary).toContain('1 page')
      expect(summary).toContain('English')
    })

    it('returns a readable summary for Germany', () => {
      const summary = getFormatSummary('DE')
      expect(summary).toContain('Germany')
      expect(summary).toContain('cv')
      expect(summary).toContain('German')
      expect(summary).toContain('photo commonly included')
    })

    it('returns null for unknown country', () => {
      expect(getFormatSummary('XX')).toBeNull()
    })

    it('includes DOB when applicable', () => {
      const summary = getFormatSummary('JP')
      expect(summary).toContain('DOB included')
    })
  })
})
