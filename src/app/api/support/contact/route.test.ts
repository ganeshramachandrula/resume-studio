import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock variables (accessible in vi.mock factories) ────────

const { mockClient, mockServiceInsert, mockServiceClient } = vi.hoisted(() => {
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
  mockClient.select.mockReturnValue(mockClient)
  mockClient.insert.mockReturnValue(mockClient)
  mockClient.update.mockReturnValue(mockClient)
  mockClient.delete.mockReturnValue(mockClient)
  mockClient.eq.mockReturnValue(mockClient)
  mockClient.from.mockImplementation(() => {
    return new Proxy(mockClient, {
      get(target: Record<string, unknown>, prop: string) {
        if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: null, error: null })
        return target[prop]
      },
    })
  })

  const mockServiceInsert = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
  const mockServiceClient = {
    from: vi.fn(() => ({
      insert: mockServiceInsert,
    })),
  }

  return { mockClient, mockServiceInsert, mockServiceClient }
})

// ── Module mocks ────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

vi.mock('@/lib/security/audit-log', () => ({ logSecurityEvent: vi.fn() }))

vi.mock('@/lib/admin/check-admin', () => ({
  getServiceClient: vi.fn(() => mockServiceClient),
}))

// ── Imports ─────────────────────────────────────────────────────────

import { POST } from '@/app/api/support/contact/route'
import { __clearRateLimitStore } from '@/lib/security/rate-limit'

// ── Helpers ─────────────────────────────────────────────────────────

function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function makeRequest(body: unknown, ip?: string): Request {
  return new Request('http://localhost:5000/api/support/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? randomIP(),
    },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  email: 'user@example.com',
  subject: 'Bug report',
  message: 'I found a bug in the resume generator and it needs fixing.',
}

// ── Tests ───────────────────────────────────────────────────────────

describe('POST /api/support/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearRateLimitStore()
    mockServiceInsert.mockResolvedValue({ data: { id: '1' }, error: null })
    mockServiceClient.from.mockImplementation(() => ({
      insert: mockServiceInsert,
    }))
    // Re-wire Supabase client chainable methods
    mockClient.select.mockReturnValue(mockClient)
    mockClient.insert.mockReturnValue(mockClient)
    mockClient.update.mockReturnValue(mockClient)
    mockClient.delete.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.from.mockImplementation(() => {
      return new Proxy(mockClient, {
        get(target: Record<string, unknown>, prop: string) {
          if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: null, error: null })
          return target[prop]
        },
      })
    })
  })

  it('returns 400 for missing required fields (email, subject, message)', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email', async () => {
    const req = makeRequest({ ...VALID_BODY, email: 'not-an-email' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.toLowerCase()).toContain('email')
  })

  it('returns 400 for message shorter than 10 characters', async () => {
    const req = makeRequest({ ...VALID_BODY, message: 'Too short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('at least 10')
  })

  it('returns 200 on valid submission without authentication', async () => {
    const req = makeRequest(VALID_BODY)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 429 after exceeding rate limit (3 per 5 min)', async () => {
    const ip = randomIP()

    // SUPPORT_RATE_LIMIT: 3 requests per 300 seconds
    for (let i = 0; i < 3; i++) {
      const req = makeRequest(VALID_BODY, ip)
      const res = await POST(req)
      expect(res.status).toBe(200)
    }

    // 4th request should be rate limited
    const req = makeRequest(VALID_BODY, ip)
    const res = await POST(req)
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error).toContain('Too many requests')
  })

  it('handles valid submission with all fields including name and category', async () => {
    const fullBody = {
      ...VALID_BODY,
      name: 'John Doe',
      category: 'bug' as const,
    }
    const req = makeRequest(fullBody)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    // Verify insert was called with correct data
    expect(mockServiceClient.from).toHaveBeenCalledWith('support_messages')
    expect(mockServiceInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'user@example.com',
        subject: 'Bug report',
        category: 'bug',
      })
    )
  })
})
