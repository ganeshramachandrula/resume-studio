import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock variables (accessible in vi.mock factories) ────────

const { mockClient } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vitest mock requires dynamic typing
  const mockClient: any = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'no session' } }),
    },
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: { allowed: true }, error: null }),
  }
  // Wire up chainable methods
  mockClient.select.mockReturnValue(mockClient)
  mockClient.insert.mockReturnValue(mockClient)
  mockClient.update.mockReturnValue(mockClient)
  mockClient.delete.mockReturnValue(mockClient)
  mockClient.eq.mockReturnValue(mockClient)

  // Make from() return a thenable proxy
  mockClient.from.mockImplementation(() => {
    return new Proxy(mockClient, {
      get(target: Record<string, unknown>, prop: string) {
        if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: { id: 'jd-1' }, error: null })
        return target[prop]
      },
    })
  })

  return { mockClient }
})

// ── Module mocks ────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

vi.mock('@/lib/security/audit-log', () => ({ logSecurityEvent: vi.fn() }))

vi.mock('@/lib/ai/claude', () => ({
  generateJSONWithClaude: vi.fn().mockResolvedValue({ company_name: 'Acme', role_title: 'Engineer' }),
  isAIConfigured: vi.fn().mockReturnValue(false),
}))

vi.mock('@/lib/ai/prompts/parse-jd', () => ({
  PARSE_JD_SYSTEM: 'system',
  buildParseJDPrompt: vi.fn().mockReturnValue('prompt'),
}))

vi.mock('@/lib/ai/mock-responses', () => ({
  mockParsedJD: { company_name: 'Mock Co', role_title: 'Dev' },
}))

// ── Imports ─────────────────────────────────────────────────────────

import { POST } from '@/app/api/ai/parse-jd/route'
import { __clearRateLimitStore } from '@/lib/security/rate-limit'
import { isAIConfigured, generateJSONWithClaude } from '@/lib/ai/claude'

// ── Helpers ─────────────────────────────────────────────────────────

function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function makeRequest(body: unknown, ip?: string): Request {
  return new Request('http://localhost:5000/api/ai/parse-jd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? randomIP(),
    },
    body: JSON.stringify(body),
  })
}

const VALID_JD = 'A'.repeat(100)

function setMockUser(user: Record<string, unknown> | null, error?: Record<string, unknown> | null) {
  mockClient.auth.getUser.mockResolvedValue({
    data: { user },
    error: error ?? (user ? null : { message: 'no session' }),
  })
}

const VERIFIED_USER = {
  id: 'user-123',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
}

const UNVERIFIED_USER = {
  id: 'user-456',
  email: 'unverified@example.com',
  email_confirmed_at: null,
}

// ── Tests ───────────────────────────────────────────────────────────

describe('POST /api/ai/parse-jd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearRateLimitStore()
    setMockUser(null)
    // Re-wire chainable methods after clearAllMocks
    mockClient.select.mockReturnValue(mockClient)
    mockClient.insert.mockReturnValue(mockClient)
    mockClient.update.mockReturnValue(mockClient)
    mockClient.delete.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.single.mockResolvedValue({ data: { plan: 'free' }, error: null })
    mockClient.rpc.mockResolvedValue({ data: { allowed: true }, error: null })
    mockClient.from.mockImplementation(() => {
      return new Proxy(mockClient, {
        get(target: Record<string, unknown>, prop: string) {
          if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: { id: 'jd-1' }, error: null })
          return target[prop]
        },
      })
    })
  })

  it('returns 401 when not authenticated', async () => {
    setMockUser(null)
    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 403 when email not verified', async () => {
    setMockUser(UNVERIFIED_USER)
    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('verify your email')
  })

  it('returns 400 when jobDescription is too short (<50 chars)', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ jobDescription: 'Too short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('at least 50')
  })

  it('returns 400 when body is not valid JSON', async () => {
    setMockUser(VERIFIED_USER)
    const ip = randomIP()
    const req = new Request('http://localhost:5000/api/ai/parse-jd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: '{not valid json!!!',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid JSON')
  })

  it('returns 429 when IP rate limit is exceeded', async () => {
    setMockUser(VERIFIED_USER)
    const ip = randomIP()

    // GENERATION_RATE_LIMIT: 10 requests per 60 seconds
    for (let i = 0; i < 10; i++) {
      const req = makeRequest({ jobDescription: VALID_JD }, ip)
      await POST(req)
    }

    // 11th request should be rate limited
    const req = makeRequest({ jobDescription: VALID_JD }, ip)
    const res = await POST(req)
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error).toContain('Too many requests')
  })

  it('returns 403 when daily limit is reached', async () => {
    setMockUser(VERIFIED_USER)
    mockClient.rpc.mockResolvedValue({ data: { allowed: false }, error: null })

    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('Daily limit reached')
  })

  it('returns 200 with mock data when AI is not configured', async () => {
    setMockUser(VERIFIED_USER)
    ;(isAIConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false)

    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 200 with success:true on valid request', async () => {
    setMockUser(VERIFIED_USER)

    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
  })

  it('returns 429 when user-level rate limit is exceeded', async () => {
    setMockUser(VERIFIED_USER)

    // Send 10 requests each with a different IP so IP rate limit does not trigger
    for (let i = 0; i < 10; i++) {
      const req = makeRequest({ jobDescription: VALID_JD }, randomIP())
      await POST(req)
    }

    // 11th request from same user but different IP should hit user-level rate limit
    const req = makeRequest({ jobDescription: VALID_JD }, randomIP())
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('calls generateJSONWithClaude when AI is configured', async () => {
    setMockUser(VERIFIED_USER)
    ;(isAIConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true)

    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(generateJSONWithClaude).toHaveBeenCalled()
  })

  it('returns 400 when jobDescription field is missing', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ wrongField: 'something' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 503 when daily gate RPC returns an error (fail closed)', async () => {
    setMockUser(VERIFIED_USER)
    mockClient.rpc.mockResolvedValue({ data: null, error: { message: 'DB is down' } })

    const req = makeRequest({ jobDescription: VALID_JD })
    const res = await POST(req)
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.error).toContain('temporarily unavailable')
  })
})
