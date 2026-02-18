import { describe, it, expect } from 'vitest'
import { comparisonPages } from '@/lib/blog/comparisons'

describe('comparisonPages', () => {
  it('has 3 entries', () => {
    expect(comparisonPages).toHaveLength(3)
  })

  it('all slugs are unique', () => {
    const slugs = comparisonPages.map((p) => p.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it('every page has required fields: slug, title, description, competitor, content', () => {
    const requiredFields = ['slug', 'title', 'description', 'competitor', 'content'] as const

    for (const page of comparisonPages) {
      for (const field of requiredFields) {
        expect(page[field], `Page "${page.slug}" is missing field "${field}"`).toBeDefined()
        expect(typeof page[field], `Page "${page.slug}" field "${field}" should be a string`).toBe('string')
        expect(page[field].trim().length, `Page "${page.slug}" field "${field}" should not be empty`).toBeGreaterThan(0)
      }
    }
  })
})
