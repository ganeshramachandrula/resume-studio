import { describe, it, expect } from 'vitest'
import { AFFILIATE_PARTNERS, buildAffiliateUrl } from '@/lib/affiliate-partners'

describe('AFFILIATE_PARTNERS', () => {
  it('has exactly 5 entries', () => {
    expect(AFFILIATE_PARTNERS).toHaveLength(5)
  })

  it('each partner has required fields', () => {
    for (const partner of AFFILIATE_PARTNERS) {
      expect(partner).toHaveProperty('id')
      expect(partner).toHaveProperty('name')
      expect(partner).toHaveProperty('description')
      expect(partner).toHaveProperty('url')
      expect(partner).toHaveProperty('category')
      expect(typeof partner.id).toBe('string')
      expect(typeof partner.name).toBe('string')
      expect(typeof partner.description).toBe('string')
      expect(typeof partner.url).toBe('string')
      expect(['job_board', 'networking', 'learning', 'tools']).toContain(partner.category)
    }
  })
})

describe('buildAffiliateUrl', () => {
  it('adds correct UTM params', () => {
    const partner = AFFILIATE_PARTNERS[0]
    const url = buildAffiliateUrl(partner)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('utm_source')).toBe('resumestudio')
    expect(parsed.searchParams.get('utm_medium')).toBe('referral')
    expect(parsed.searchParams.get('utm_campaign')).toBe('partner_resources')
    expect(parsed.searchParams.get('utm_content')).toBe(partner.id)
  })

  it('generates valid URLs for all partners', () => {
    for (const partner of AFFILIATE_PARTNERS) {
      const url = buildAffiliateUrl(partner)
      // URL constructor throws if invalid
      const parsed = new URL(url)
      expect(parsed.hostname).toBeTruthy()
      expect(parsed.searchParams.get('utm_source')).toBe('resumestudio')
      expect(parsed.searchParams.get('utm_content')).toBe(partner.id)
    }
  })

  it('preserves original URL base', () => {
    const partner = AFFILIATE_PARTNERS.find((p) => p.id === 'indeed')!
    const url = buildAffiliateUrl(partner)
    expect(url).toContain('indeed.com')
  })
})
