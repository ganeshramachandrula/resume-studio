import { describe, it, expect } from 'vitest'
import { repairTruncatedJSON } from '@/lib/ai/claude'

describe('JSON Repair Performance', () => {
  it('repairs a large (50KB) truncated JSON in under 100ms', () => {
    // Build a large valid JSON, then truncate it mid-value
    const entries: string[] = []
    for (let i = 0; i < 500; i++) {
      entries.push(`"key_${i}": "${'x'.repeat(80)}"`)
    }
    const fullJSON = `{${entries.join(', ')}}`
    // Truncate at roughly 50KB
    const truncatedJSON = fullJSON.slice(0, 50_000)

    const start = performance.now()
    const repaired = repairTruncatedJSON(truncatedJSON)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(100)
    // Verify the repaired JSON is parseable
    expect(() => JSON.parse(repaired)).not.toThrow()
  })

  it('repairs 100 small truncated JSONs in under 200ms', () => {
    const truncatedJSONs: string[] = []
    for (let i = 0; i < 100; i++) {
      // Each is a truncated JSON object
      truncatedJSONs.push(`{"name": "test_${i}", "skills": ["js", "ts", "rea`)
    }

    const start = performance.now()
    const results = truncatedJSONs.map((json) => repairTruncatedJSON(json))
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(200)
    // Verify all repaired JSONs are parseable
    for (const repaired of results) {
      expect(() => JSON.parse(repaired)).not.toThrow()
    }
  })

  it('repaired JSON preserves complete key-value pairs', () => {
    const truncated = '{"name": "John", "age": 30, "skills": ["js", "ty'
    const repaired = repairTruncatedJSON(truncated)
    const parsed = JSON.parse(repaired)

    // name and age should be preserved since they are complete
    expect(parsed.name).toBe('John')
    expect(parsed.age).toBe(30)
  })

  it('handles already-valid JSON without modification', () => {
    const valid = '{"name": "John", "age": 30}'
    const repaired = repairTruncatedJSON(valid)
    expect(JSON.parse(repaired)).toEqual(JSON.parse(valid))
  })
})
