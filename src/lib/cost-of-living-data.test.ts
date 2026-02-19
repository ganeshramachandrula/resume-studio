import { describe, it, expect } from 'vitest'
import {
  CITIES,
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  costDifference,
  totalMonthlyCost,
  getRegions,
  getCitiesByRegion,
  type CityData,
} from './cost-of-living-data'

describe('cost-of-living-data', () => {
  describe('CITIES dataset', () => {
    it('has at least 50 cities', () => {
      expect(CITIES.length).toBeGreaterThanOrEqual(50)
    })

    it('every city has all required fields', () => {
      for (const city of CITIES) {
        expect(city.city).toBeTruthy()
        expect(city.country).toBeTruthy()
        expect(city.region).toBeTruthy()
        for (const cat of COST_CATEGORIES) {
          expect(typeof city.costs[cat]).toBe('number')
          expect(city.costs[cat]).toBeGreaterThan(0)
        }
      }
    })

    it('all cost category labels are defined', () => {
      for (const cat of COST_CATEGORIES) {
        expect(COST_CATEGORY_LABELS[cat]).toBeTruthy()
      }
    })

    it('has cities from all 5 regions', () => {
      const regions = new Set(CITIES.map((c) => c.region))
      expect(regions.size).toBe(5)
      expect(regions.has('North America')).toBe(true)
      expect(regions.has('Europe')).toBe(true)
      expect(regions.has('Asia-Pacific')).toBe(true)
      expect(regions.has('Middle East & Africa')).toBe(true)
      expect(regions.has('South America')).toBe(true)
    })

    it('has no duplicate city-country pairs', () => {
      const keys = CITIES.map((c) => `${c.city}-${c.country}`)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  describe('costDifference', () => {
    it('returns 0 when values are equal', () => {
      expect(costDifference(1000, 1000)).toBe(0)
    })

    it('returns positive percentage when v2 is more expensive', () => {
      expect(costDifference(1000, 1500)).toBe(50)
    })

    it('returns negative percentage when v2 is cheaper', () => {
      expect(costDifference(1000, 800)).toBe(-20)
    })

    it('returns 0 when v1 is 0', () => {
      expect(costDifference(0, 500)).toBe(0)
    })

    it('rounds to nearest integer', () => {
      expect(costDifference(300, 400)).toBe(33) // 33.33... rounds to 33
    })
  })

  describe('totalMonthlyCost', () => {
    it('sums all cost categories', () => {
      const city: CityData = {
        city: 'Test',
        country: 'Test',
        region: 'North America',
        costs: { rent: 1000, groceries: 200, transport: 100, utilities: 50, dining: 80, entertainment: 70 },
      }
      expect(totalMonthlyCost(city)).toBe(1500)
    })

    it('returns correct value for a real city', () => {
      const nyc = CITIES.find((c) => c.city === 'New York')!
      const total = nyc.costs.rent + nyc.costs.groceries + nyc.costs.transport + nyc.costs.utilities + nyc.costs.dining + nyc.costs.entertainment
      expect(totalMonthlyCost(nyc)).toBe(total)
    })
  })

  describe('getRegions', () => {
    it('returns all unique regions', () => {
      const regions = getRegions()
      expect(regions.length).toBe(5)
    })
  })

  describe('getCitiesByRegion', () => {
    it('returns only cities from the given region', () => {
      const european = getCitiesByRegion('Europe')
      expect(european.length).toBeGreaterThan(0)
      for (const city of european) {
        expect(city.region).toBe('Europe')
      }
    })

    it('returns empty array for unknown region', () => {
      expect(getCitiesByRegion('Antarctica')).toEqual([])
    })
  })
})
