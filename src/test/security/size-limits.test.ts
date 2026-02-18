import { describe, it, expect } from 'vitest'
import { validateBody, isValidationError } from '@/lib/security/validation'
import { parseJDSchema, generateDocSchema } from '@/lib/security/validation'

describe('JSON Body Size Enforcement', () => {
  it('accepts a normal-sized request body', async () => {
    const body = { jobDescription: 'A'.repeat(100) }
    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await validateBody(request, parseJDSchema)
    // Should fail validation (jobDescription < 50 chars won't fail here since it's 100 chars)
    // Actually 100 chars is valid for parseJDSchema (min 50)
    expect(isValidationError(result)).toBe(false)
    expect((result as { jobDescription: string }).jobDescription).toBe('A'.repeat(100))
  })

  it('rejects body over 500KB with 413 status', async () => {
    // Create a body larger than 500KB
    const largeBody = JSON.stringify({ jobDescription: 'A'.repeat(600_000) })
    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: largeBody,
    })

    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    // result is a NextResponse
    const response = result as Response
    expect(response.status).toBe(413)
    const json = await response.json()
    expect(json.error).toContain('500KB')
  })

  it('fast-rejects when Content-Length header exceeds 500KB', async () => {
    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(600 * 1024),
      },
      body: '{}',
    })

    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    const response = result as Response
    expect(response.status).toBe(413)
  })

  it('rejects a single field over 100KB in generateDocSchema (parsedJD field)', async () => {
    // Create a parsedJD object that serializes to > 100KB
    const largeParsedJD: Record<string, unknown> = {}
    for (let i = 0; i < 200; i++) {
      largeParsedJD[`key_${i}`] = 'x'.repeat(600)
    }
    // This should be > 100KB when serialized

    const body = {
      parsedJD: largeParsedJD,
      experience: 'Some experience that is at least 10 characters long.',
      jobDescriptionId: '00000000-0000-0000-0000-000000000001',
    }

    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await validateBody(request, generateDocSchema)
    expect(isValidationError(result)).toBe(true)
    const response = result as Response
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('100KB')
  })

  it('rejects invalid JSON with 400 status', async () => {
    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'this is not json{{{',
    })

    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    const response = result as Response
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('Invalid JSON')
  })

  it('rejects empty body with 400 status', async () => {
    const request = new Request('http://localhost:5000/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '',
    })

    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    const response = result as Response
    expect(response.status).toBe(400)
  })
})
