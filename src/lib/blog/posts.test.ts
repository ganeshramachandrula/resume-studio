import { describe, it, expect } from 'vitest'
import { blogPosts } from '@/lib/blog/posts'

describe('blogPosts', () => {
  it('has 5 entries', () => {
    expect(blogPosts).toHaveLength(5)
  })

  it('all slugs are unique (no duplicates)', () => {
    const slugs = blogPosts.map((p) => p.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it('every post has required fields: slug, title, description, publishedAt, readTime, content', () => {
    const requiredFields = ['slug', 'title', 'description', 'publishedAt', 'readTime', 'content'] as const

    for (const post of blogPosts) {
      for (const field of requiredFields) {
        expect(post[field], `Post "${post.slug}" is missing field "${field}"`).toBeDefined()
        expect(typeof post[field], `Post "${post.slug}" field "${field}" should be a string`).toBe('string')
      }
    }
  })

  it('content is non-empty for all posts', () => {
    for (const post of blogPosts) {
      expect(post.content.trim().length, `Post "${post.slug}" has empty content`).toBeGreaterThan(0)
    }
  })

  it('publishedAt is a valid date string', () => {
    for (const post of blogPosts) {
      const date = new Date(post.publishedAt)
      expect(isNaN(date.getTime()), `Post "${post.slug}" has invalid date "${post.publishedAt}"`).toBe(false)
    }
  })
})
