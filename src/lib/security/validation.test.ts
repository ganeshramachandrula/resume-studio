import { describe, it, expect } from 'vitest'
import {
  parseJDSchema,
  contactInfoSchema,
  generateDocSchema,
  careerCoachSchema,
  atsScoreSchema,
  createCheckoutSchema,
  supportContactSchema,
  adminUserUpdateSchema,
  adminMessageUpdateSchema,
  jobSearchSchema,
  jobPreferencesSchema,
  extensionSubmitSchema,
  validateBody,
  isValidationError,
} from '@/lib/security/validation'
import { NextResponse } from 'next/server'

// ── parseJDSchema ────────────────────────────────────────────

describe('parseJDSchema', () => {
  it('accepts a valid job description', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 'A'.repeat(50) })
    expect(result.success).toBe(true)
  })

  it('rejects a job description shorter than 50 characters', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 'A'.repeat(49) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 50')
    }
  })

  it('accepts a job description at exactly 50 characters', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 'X'.repeat(50) })
    expect(result.success).toBe(true)
  })

  it('accepts a job description at exactly 15000 characters', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 'Y'.repeat(15_000) })
    expect(result.success).toBe(true)
  })

  it('rejects a job description longer than 15000 characters', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 'Z'.repeat(15_001) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('15,000')
    }
  })

  it('rejects missing jobDescription field', () => {
    const result = parseJDSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects non-string jobDescription', () => {
    const result = parseJDSchema.safeParse({ jobDescription: 12345 })
    expect(result.success).toBe(false)
  })
})

// ── contactInfoSchema ────────────────────────────────────────

describe('contactInfoSchema', () => {
  it('accepts valid contact info with all fields', () => {
    const result = contactInfoSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/johndoe',
    })
    expect(result.success).toBe(true)
  })

  it('accepts contact info with only required fields', () => {
    const result = contactInfoSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('')
      expect(result.data.location).toBe('')
      expect(result.data.linkedin).toBe('')
    }
  })

  it('rejects name exceeding 200 characters', () => {
    const result = contactInfoSchema.safeParse({
      name: 'A'.repeat(201),
      email: 'test@test.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects email exceeding 300 characters', () => {
    const result = contactInfoSchema.safeParse({
      name: 'Test',
      email: 'A'.repeat(301),
    })
    expect(result.success).toBe(false)
  })

  it('rejects phone exceeding 50 characters', () => {
    const result = contactInfoSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      phone: '1'.repeat(51),
    })
    expect(result.success).toBe(false)
  })

  it('rejects location exceeding 200 characters', () => {
    const result = contactInfoSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      location: 'A'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('rejects linkedin exceeding 500 characters', () => {
    const result = contactInfoSchema.safeParse({
      name: 'Test',
      email: 'test@test.com',
      linkedin: 'A'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

// ── generateDocSchema ────────────────────────────────────────

describe('generateDocSchema', () => {
  const validDoc = {
    parsedJD: { title: 'Engineer', company: 'Acme' },
    experience: 'I have 5 years of experience in software engineering.',
    jobDescriptionId: '550e8400-e29b-41d4-a716-446655440000',
  }

  it('accepts a valid generate doc payload', () => {
    const result = generateDocSchema.safeParse(validDoc)
    expect(result.success).toBe(true)
  })

  it('rejects empty parsedJD object', () => {
    const result = generateDocSchema.safeParse({ ...validDoc, parsedJD: {} })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required')
    }
  })

  it('rejects parsedJD exceeding 100KB', () => {
    const bigJD: Record<string, string> = {}
    // Create an object > 100KB
    for (let i = 0; i < 200; i++) {
      bigJD[`key_${i}`] = 'X'.repeat(600)
    }
    const result = generateDocSchema.safeParse({ ...validDoc, parsedJD: bigJD })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('100KB'))).toBe(true)
    }
  })

  it('rejects experience shorter than 10 characters', () => {
    const result = generateDocSchema.safeParse({ ...validDoc, experience: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects experience longer than 20000 characters', () => {
    const result = generateDocSchema.safeParse({ ...validDoc, experience: 'A'.repeat(20_001) })
    expect(result.success).toBe(false)
  })

  it('accepts experience at exactly 10 characters', () => {
    const result = generateDocSchema.safeParse({ ...validDoc, experience: 'A'.repeat(10) })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid for jobDescriptionId', () => {
    const result = generateDocSchema.safeParse({ ...validDoc, jobDescriptionId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts valid uuid for jobDescriptionId', () => {
    const result = generateDocSchema.safeParse({
      ...validDoc,
      jobDescriptionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional contactInfo', () => {
    const result = generateDocSchema.safeParse({
      ...validDoc,
      contactInfo: { name: 'John', email: 'john@test.com' },
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional language', () => {
    const result = generateDocSchema.safeParse({
      ...validDoc,
      language: 'Spanish',
    })
    expect(result.success).toBe(true)
  })
})

// ── careerCoachSchema ────────────────────────────────────────

describe('careerCoachSchema', () => {
  it('accepts a valid message', () => {
    const result = careerCoachSchema.safeParse({ message: 'How do I improve my resume?' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty message', () => {
    const result = careerCoachSchema.safeParse({ message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a message over 5000 characters', () => {
    const result = careerCoachSchema.safeParse({ message: 'A'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('accepts a message at exactly 5000 characters', () => {
    const result = careerCoachSchema.safeParse({ message: 'B'.repeat(5000) })
    expect(result.success).toBe(true)
  })

  it('accepts optional valid conversationId uuid', () => {
    const result = careerCoachSchema.safeParse({
      message: 'Hello',
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid conversationId', () => {
    const result = careerCoachSchema.safeParse({
      message: 'Hello',
      conversationId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('accepts without conversationId', () => {
    const result = careerCoachSchema.safeParse({ message: 'Hello' })
    expect(result.success).toBe(true)
  })
})

// ── atsScoreSchema ───────────────────────────────────────────

describe('atsScoreSchema', () => {
  const validAts = {
    resumeJSON: { name: 'John', skills: ['JS'] },
    parsedJD: { title: 'Engineer' },
  }

  it('accepts valid ATS score payload', () => {
    const result = atsScoreSchema.safeParse(validAts)
    expect(result.success).toBe(true)
  })

  it('rejects empty resumeJSON', () => {
    const result = atsScoreSchema.safeParse({ ...validAts, resumeJSON: {} })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Resume data is required')
    }
  })

  it('rejects empty parsedJD', () => {
    const result = atsScoreSchema.safeParse({ ...validAts, parsedJD: {} })
    expect(result.success).toBe(false)
  })

  it('rejects resumeJSON exceeding 100KB', () => {
    const bigResume: Record<string, string> = {}
    for (let i = 0; i < 200; i++) {
      bigResume[`key_${i}`] = 'X'.repeat(600)
    }
    const result = atsScoreSchema.safeParse({ ...validAts, resumeJSON: bigResume })
    expect(result.success).toBe(false)
  })

  it('rejects parsedJD exceeding 100KB', () => {
    const bigJD: Record<string, string> = {}
    for (let i = 0; i < 200; i++) {
      bigJD[`key_${i}`] = 'X'.repeat(600)
    }
    const result = atsScoreSchema.safeParse({ ...validAts, parsedJD: bigJD })
    expect(result.success).toBe(false)
  })

  it('accepts optional valid documentId uuid', () => {
    const result = atsScoreSchema.safeParse({
      ...validAts,
      documentId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid documentId', () => {
    const result = atsScoreSchema.safeParse({
      ...validAts,
      documentId: 'bad-id',
    })
    expect(result.success).toBe(false)
  })
})

// ── createCheckoutSchema ─────────────────────────────────────

describe('createCheckoutSchema', () => {
  it('accepts a valid priceId with default mode', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'price_abc123' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.mode).toBe('subscription')
    }
  })

  it('rejects empty priceId', () => {
    const result = createCheckoutSchema.safeParse({ priceId: '' })
    expect(result.success).toBe(false)
  })

  it('rejects priceId over 100 characters', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('accepts mode subscription', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'price_1', mode: 'subscription' })
    expect(result.success).toBe(true)
  })

  it('accepts mode payment', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'price_1', mode: 'payment' })
    expect(result.success).toBe(true)
  })

  it('accepts mode team', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'price_1', mode: 'team' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid mode', () => {
    const result = createCheckoutSchema.safeParse({ priceId: 'price_1', mode: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('accepts quantity of 5 (minimum for team)', () => {
    const result = createCheckoutSchema.safeParse({
      priceId: 'price_1',
      mode: 'team',
      quantity: 5,
    })
    expect(result.success).toBe(true)
  })

  it('rejects quantity below 5', () => {
    const result = createCheckoutSchema.safeParse({
      priceId: 'price_1',
      mode: 'team',
      quantity: 4,
    })
    expect(result.success).toBe(false)
  })

  it('rejects quantity above 100', () => {
    const result = createCheckoutSchema.safeParse({
      priceId: 'price_1',
      mode: 'team',
      quantity: 101,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer quantity', () => {
    const result = createCheckoutSchema.safeParse({
      priceId: 'price_1',
      quantity: 5.5,
    })
    expect(result.success).toBe(false)
  })
})

// ── supportContactSchema ─────────────────────────────────────

describe('supportContactSchema', () => {
  const validSupport = {
    email: 'user@example.com',
    subject: 'Bug report',
    message: 'I found a bug in the resume generator tool.',
  }

  it('accepts a valid support contact payload', () => {
    const result = supportContactSchema.safeParse(validSupport)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('rejects subject shorter than 3 characters', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, subject: 'ab' })
    expect(result.success).toBe(false)
  })

  it('rejects subject longer than 200 characters', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, subject: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects message shorter than 10 characters', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, message: 'Too short' })
    expect(result.success).toBe(false)
  })

  it('rejects message longer than 5000 characters', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, message: 'A'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const category of ['bug', 'feature', 'billing', 'general'] as const) {
      const result = supportContactSchema.safeParse({ ...validSupport, category })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid category', () => {
    const result = supportContactSchema.safeParse({ ...validSupport, category: 'complaint' })
    expect(result.success).toBe(false)
  })

  it('defaults category to general when not provided', () => {
    const result = supportContactSchema.safeParse(validSupport)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('general')
    }
  })
})

// ── adminUserUpdateSchema ────────────────────────────────────

describe('adminUserUpdateSchema', () => {
  it('accepts valid plan values', () => {
    for (const plan of ['free', 'pro_monthly', 'pro_annual', 'team'] as const) {
      const result = adminUserUpdateSchema.safeParse({ plan })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid plan', () => {
    const result = adminUserUpdateSchema.safeParse({ plan: 'enterprise' })
    expect(result.success).toBe(false)
  })

  it('accepts valid usage_count', () => {
    const result = adminUserUpdateSchema.safeParse({ usage_count: 10 })
    expect(result.success).toBe(true)
  })

  it('rejects negative usage_count', () => {
    const result = adminUserUpdateSchema.safeParse({ usage_count: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts valid credits', () => {
    const result = adminUserUpdateSchema.safeParse({ credits: 5 })
    expect(result.success).toBe(true)
  })

  it('rejects negative credits', () => {
    const result = adminUserUpdateSchema.safeParse({ credits: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts valid role values', () => {
    for (const role of ['user', 'admin'] as const) {
      const result = adminUserUpdateSchema.safeParse({ role })
      expect(result.success).toBe(true)
    }
  })

  it('accepts is_disabled boolean', () => {
    const result = adminUserUpdateSchema.safeParse({ is_disabled: true })
    expect(result.success).toBe(true)
  })

  it('accepts valid saved_applications_count', () => {
    const result = adminUserUpdateSchema.safeParse({ saved_applications_count: 0 })
    expect(result.success).toBe(true)
  })

  it('rejects negative saved_applications_count', () => {
    const result = adminUserUpdateSchema.safeParse({ saved_applications_count: -5 })
    expect(result.success).toBe(false)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = adminUserUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ── adminMessageUpdateSchema ─────────────────────────────────

describe('adminMessageUpdateSchema', () => {
  it('accepts valid status values', () => {
    for (const status of ['new', 'in_progress', 'resolved', 'closed'] as const) {
      const result = adminMessageUpdateSchema.safeParse({ status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    const result = adminMessageUpdateSchema.safeParse({ status: 'pending' })
    expect(result.success).toBe(false)
  })

  it('accepts admin_notes within limit', () => {
    const result = adminMessageUpdateSchema.safeParse({ admin_notes: 'Some note' })
    expect(result.success).toBe(true)
  })

  it('rejects admin_notes exceeding 5000 characters', () => {
    const result = adminMessageUpdateSchema.safeParse({ admin_notes: 'A'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('accepts empty object', () => {
    const result = adminMessageUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ── jobSearchSchema ──────────────────────────────────────────

describe('jobSearchSchema', () => {
  it('accepts a valid search query', () => {
    const result = jobSearchSchema.safeParse({ query: 'software engineer' })
    expect(result.success).toBe(true)
  })

  it('rejects query shorter than 2 characters', () => {
    const result = jobSearchSchema.safeParse({ query: 'a' })
    expect(result.success).toBe(false)
  })

  it('rejects query longer than 200 characters', () => {
    const result = jobSearchSchema.safeParse({ query: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts optional location', () => {
    const result = jobSearchSchema.safeParse({ query: 'engineer', location: 'NYC' })
    expect(result.success).toBe(true)
  })

  it('defaults page to 1', () => {
    const result = jobSearchSchema.safeParse({ query: 'engineer' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
    }
  })

  it('rejects page below 1', () => {
    const result = jobSearchSchema.safeParse({ query: 'engineer', page: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects page above 100', () => {
    const result = jobSearchSchema.safeParse({ query: 'engineer', page: 101 })
    expect(result.success).toBe(false)
  })

  it('defaults remote_only to false', () => {
    const result = jobSearchSchema.safeParse({ query: 'engineer' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.remote_only).toBe(false)
    }
  })
})

// ── jobPreferencesSchema ─────────────────────────────────────

describe('jobPreferencesSchema', () => {
  it('accepts valid preferences', () => {
    const result = jobPreferencesSchema.safeParse({
      skills: ['JavaScript', 'TypeScript'],
      roles: ['Frontend Engineer'],
      locations: ['San Francisco'],
      salary_min: 80000,
      salary_max: 150000,
      remote_preference: 'remote',
    })
    expect(result.success).toBe(true)
  })

  it('rejects skills array exceeding 20 items', () => {
    const skills = Array.from({ length: 21 }, (_, i) => `skill_${i}`)
    const result = jobPreferencesSchema.safeParse({ skills })
    expect(result.success).toBe(false)
  })

  it('rejects roles array exceeding 10 items', () => {
    const roles = Array.from({ length: 11 }, (_, i) => `role_${i}`)
    const result = jobPreferencesSchema.safeParse({ roles })
    expect(result.success).toBe(false)
  })

  it('rejects locations array exceeding 10 items', () => {
    const locations = Array.from({ length: 11 }, (_, i) => `loc_${i}`)
    const result = jobPreferencesSchema.safeParse({ locations })
    expect(result.success).toBe(false)
  })

  it('rejects negative salary_min', () => {
    const result = jobPreferencesSchema.safeParse({ salary_min: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects salary_max above 1000000', () => {
    const result = jobPreferencesSchema.safeParse({ salary_max: 1_000_001 })
    expect(result.success).toBe(false)
  })

  it('accepts nullable salary values', () => {
    const result = jobPreferencesSchema.safeParse({ salary_min: null, salary_max: null })
    expect(result.success).toBe(true)
  })

  it('accepts valid remote_preference values', () => {
    for (const pref of ['any', 'remote', 'hybrid', 'onsite'] as const) {
      const result = jobPreferencesSchema.safeParse({ remote_preference: pref })
      expect(result.success).toBe(true)
    }
  })

  it('defaults to empty arrays and any remote preference', () => {
    const result = jobPreferencesSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.skills).toEqual([])
      expect(result.data.roles).toEqual([])
      expect(result.data.locations).toEqual([])
      expect(result.data.remote_preference).toBe('any')
    }
  })

  it('rejects individual skill string exceeding 100 characters', () => {
    const result = jobPreferencesSchema.safeParse({ skills: ['A'.repeat(101)] })
    expect(result.success).toBe(false)
  })
})

// ── extensionSubmitSchema ────────────────────────────────────

describe('extensionSubmitSchema', () => {
  it('accepts valid extension submit payload', () => {
    const result = extensionSubmitSchema.safeParse({
      source_url: 'https://www.indeed.com/job/123',
      source_site: 'indeed',
      raw_text: 'A'.repeat(100),
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL', () => {
    const result = extensionSubmitSchema.safeParse({
      source_url: 'not-a-url',
      raw_text: 'A'.repeat(100),
    })
    expect(result.success).toBe(false)
  })

  it('rejects raw_text shorter than 50 characters', () => {
    const result = extensionSubmitSchema.safeParse({ raw_text: 'A'.repeat(49) })
    expect(result.success).toBe(false)
  })

  it('rejects raw_text longer than 15000 characters', () => {
    const result = extensionSubmitSchema.safeParse({ raw_text: 'A'.repeat(15_001) })
    expect(result.success).toBe(false)
  })

  it('accepts raw_text at exactly 50 characters', () => {
    const result = extensionSubmitSchema.safeParse({ raw_text: 'B'.repeat(50) })
    expect(result.success).toBe(true)
  })

  it('accepts without optional source_url and source_site', () => {
    const result = extensionSubmitSchema.safeParse({ raw_text: 'C'.repeat(100) })
    expect(result.success).toBe(true)
  })
})

// ── validateBody ─────────────────────────────────────────────

describe('validateBody', () => {
  it('returns validated data for valid JSON body', async () => {
    const body = JSON.stringify({ jobDescription: 'A'.repeat(100) })
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(false)
    if (!isValidationError(result)) {
      expect(result.jobDescription).toBe('A'.repeat(100))
    }
  })

  it('returns 400 for invalid JSON', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json',
    })
    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    if (result instanceof NextResponse) {
      const json = await result.json()
      expect(json.error).toBe('Invalid JSON body')
      expect(result.status).toBe(400)
    }
  })

  it('returns 413 when content-length exceeds 500KB', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'content-length': String(600 * 1024),
      },
      body: '{}',
    })
    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    if (result instanceof NextResponse) {
      expect(result.status).toBe(413)
      const json = await result.json()
      expect(json.error).toContain('500KB')
    }
  })

  it('returns 413 when actual body exceeds 500KB', async () => {
    const bigBody = JSON.stringify({ data: 'X'.repeat(600 * 1024) })
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bigBody,
    })
    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    if (result instanceof NextResponse) {
      expect(result.status).toBe(413)
    }
  })

  it('returns 400 for validation error with schema message', async () => {
    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: 'short' }),
    })
    const result = await validateBody(request, parseJDSchema)
    expect(isValidationError(result)).toBe(true)
    if (result instanceof NextResponse) {
      expect(result.status).toBe(400)
      const json = await result.json()
      expect(json.error).toContain('at least 50')
    }
  })
})

// ── isValidationError ────────────────────────────────────────

describe('isValidationError', () => {
  it('returns true for NextResponse', () => {
    const response = NextResponse.json({ error: 'bad' }, { status: 400 })
    expect(isValidationError(response)).toBe(true)
  })

  it('returns false for plain object data', () => {
    expect(isValidationError({ jobDescription: 'test' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidationError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidationError(undefined)).toBe(false)
  })

  it('returns false for string', () => {
    expect(isValidationError('hello')).toBe(false)
  })
})
