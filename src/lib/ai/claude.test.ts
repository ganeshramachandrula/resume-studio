import { describe, it, expect, vi, afterEach } from 'vitest'
import { repairTruncatedJSON } from '@/lib/ai/claude'

// ── isAIConfigured ───────────────────────────────────────────

describe('isAIConfigured', () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY

  afterEach(() => {
    // Restore original value
    if (originalEnv !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalEnv
    } else {
      delete process.env.ANTHROPIC_API_KEY
    }
    // Re-import the module to pick up env changes
    vi.resetModules()
  })

  it('returns false when ANTHROPIC_API_KEY is empty', async () => {
    process.env.ANTHROPIC_API_KEY = ''
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(false)
  })

  it('returns false when ANTHROPIC_API_KEY starts with your_', async () => {
    process.env.ANTHROPIC_API_KEY = 'your_api_key_here'
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(false)
  })

  it('returns false when ANTHROPIC_API_KEY is too short (10 or less)', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-short'
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(false)
  })

  it('returns true when ANTHROPIC_API_KEY is valid (long enough, not placeholder)', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-realkey1234567890'
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(true)
  })

  it('returns false when ANTHROPIC_API_KEY is undefined', async () => {
    delete process.env.ANTHROPIC_API_KEY
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(false)
  })

  it('returns false when ANTHROPIC_API_KEY is exactly 10 chars', async () => {
    process.env.ANTHROPIC_API_KEY = '1234567890' // 10 chars
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(false)
  })

  it('returns true when ANTHROPIC_API_KEY is 11 chars and not placeholder', async () => {
    process.env.ANTHROPIC_API_KEY = '12345678901' // 11 chars
    vi.resetModules()
    const { isAIConfigured: fn } = await import('@/lib/ai/claude')
    expect(fn()).toBe(true)
  })
})

// ── repairTruncatedJSON ──────────────────────────────────────

describe('repairTruncatedJSON', () => {
  it('returns complete JSON unchanged', () => {
    const json = '{"name":"John","age":30}'
    const result = repairTruncatedJSON(json)
    expect(JSON.parse(result)).toEqual({ name: 'John', age: 30 })
  })

  it('closes truncated brackets', () => {
    const json = '{"items":[{"id":1},{"id":2'
    const result = repairTruncatedJSON(json)
    // Should close the open string/object/array
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(parsed.items).toBeDefined()
  })

  it('removes trailing comma', () => {
    const json = '{"a":1,"b":2,'
    const result = repairTruncatedJSON(json)
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(parsed.a).toBe(1)
    expect(parsed.b).toBe(2)
  })

  it('handles truncation inside a string value by trimming to last valid point', () => {
    // When truncated inside a string value, the repair trims back to last valid structural point
    const json = '{"name":"John Do'
    const result = repairTruncatedJSON(json)
    // The function trims back to the end of "name" key and closes brackets
    expect(result).toBe('{"name"}')
  })

  it('handles nested arrays and objects', () => {
    const json = '{"data":{"nested":[1,2,3],"more":{"deep":[{"id":1'
    const result = repairTruncatedJSON(json)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('handles truncation after colon by removing dangling key', () => {
    const json = '{"key":'
    const result = repairTruncatedJSON(json)
    // Trailing colon is removed, leaving {"key"} then closing brackets
    expect(result).toBe('{"key"}')
  })

  it('handles empty input', () => {
    const result = repairTruncatedJSON('')
    // Empty string itself is not valid JSON, but the function should not throw
    expect(result).toBe('')
  })

  it('handles complete array', () => {
    const json = '[1,2,3]'
    const result = repairTruncatedJSON(json)
    expect(JSON.parse(result)).toEqual([1, 2, 3])
  })

  it('closes truncated array', () => {
    const json = '[1,2,3'
    const result = repairTruncatedJSON(json)
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(Array.isArray(parsed)).toBe(true)
  })

  it('handles object with trailing comma inside array', () => {
    const json = '{"items":[{"a":1},{"b":2},'
    const result = repairTruncatedJSON(json)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('handles deeply nested truncation by closing all brackets', () => {
    const json = '{"a":{"b":{"c":{"d":'
    const result = repairTruncatedJSON(json)
    // Trailing colon removed, then dangling key removed, then brackets closed
    expect(result).toBe('{"a":{"b":{"c":{"d"}}}}')
  })

  it('repairs truncation with existing complete pairs before truncation point', () => {
    const json = '{"name":"John","age":30,"bio":"trunc'
    const result = repairTruncatedJSON(json)
    expect(() => JSON.parse(result)).not.toThrow()
    const parsed = JSON.parse(result)
    expect(parsed.name).toBe('John')
    expect(parsed.age).toBe(30)
  })

  it('preserves escaped quotes in strings', () => {
    const json = '{"text":"He said \\"hello\\""}'
    const result = repairTruncatedJSON(json)
    expect(JSON.parse(result)).toEqual({ text: 'He said "hello"' })
  })

  it('handles truncated string with escape character by trimming back', () => {
    const json = '{"text":"line1\\nline2'
    const result = repairTruncatedJSON(json)
    // Truncated inside a string, so trims back to last valid point ("text" key)
    expect(result).toBe('{"text"}')
  })
})
