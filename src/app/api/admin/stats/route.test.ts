import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock variables (accessible in vi.mock factories) ────────

const { mockClient, mockCheckAdmin, mockServiceChainable } = vi.hoisted(() => {
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

  const mockCheckAdmin = vi.fn().mockResolvedValue({ isAdmin: false, profile: null })

  // Chainable mock for the service client
  // Each call in Promise.all resolves with { count, data, error }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vitest mock requires dynamic typing
  const mockServiceChainable: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
  }

  return { mockClient, mockCheckAdmin, mockServiceChainable }
})

// ── Module mocks ────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

vi.mock('@/lib/security/audit-log', () => ({ logSecurityEvent: vi.fn() }))

vi.mock('@/lib/admin/check-admin', () => ({
  checkAdmin: (...args: unknown[]) => mockCheckAdmin(...args),
  getServiceClient: () => ({
    from: vi.fn(() => mockServiceChainable),
  }),
}))

// ── Imports ─────────────────────────────────────────────────────────

import { GET } from '@/app/api/admin/stats/route'
import { __clearRateLimitStore } from '@/lib/security/rate-limit'

// ── Helpers ─────────────────────────────────────────────────────────

function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function makeRequest(ip?: string): Request {
  return new Request('http://localhost:5000/api/admin/stats', {
    method: 'GET',
    headers: {
      'x-forwarded-for': ip ?? randomIP(),
    },
  })
}

function setMockUser(user: Record<string, unknown> | null, error?: Record<string, unknown> | null) {
  mockClient.auth.getUser.mockResolvedValue({
    data: { user },
    error: error ?? (user ? null : { message: 'no session' }),
  })
}

const ADMIN_USER = {
  id: 'admin-user-1',
  email: 'admin@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
}

const REGULAR_USER = {
  id: 'regular-user-1',
  email: 'user@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
}

/** Set up service chainable to resolve with given count and data for all queries */
function setServiceResults(count: number, data: unknown[]) {
  // Reset chainable so all chained calls resolve with the same result
  mockServiceChainable.select.mockReturnThis()
  mockServiceChainable.eq.mockReturnThis()
  mockServiceChainable.in.mockReturnThis()
  mockServiceChainable.gt.mockReturnThis()
  // Make it thenable so Promise.all can resolve each item
  Object.defineProperty(mockServiceChainable, 'then', {
    value: (resolve: (v: unknown) => void) => resolve({ count, data, error: null }),
    writable: true,
    configurable: true,
  })
}

// ── Tests ───────────────────────────────────────────────────────────

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearRateLimitStore()
    setMockUser(null)
    mockCheckAdmin.mockResolvedValue({ isAdmin: false, profile: null })
    setServiceResults(0, [])
  })

  it('returns 401 when not authenticated', async () => {
    setMockUser(null)
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 403 when user is not admin', async () => {
    setMockUser(REGULAR_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: false,
      profile: { id: REGULAR_USER.id, email: REGULAR_USER.email, role: 'user', is_disabled: false },
    })

    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('Access denied')
  })

  it('returns 200 with stats when user is admin', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: true,
      profile: { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin', is_disabled: false },
    })
    setServiceResults(5, [])

    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('totalUsers')
    expect(json).toHaveProperty('proUsers')
    expect(json).toHaveProperty('freeUsers')
    expect(json).toHaveProperty('teamUsers')
    expect(json).toHaveProperty('teamCount')
    expect(json).toHaveProperty('disabledUsers')
    expect(json).toHaveProperty('totalDocuments')
    expect(json).toHaveProperty('newMessages')
    expect(json).toHaveProperty('openMessages')
    expect(json).toHaveProperty('totalCoachMessages')
    expect(json).toHaveProperty('activeCoachUsers')
    expect(json).toHaveProperty('creditUsersCount')
    expect(json).toHaveProperty('totalCreditsHeld')
  })

  it('returns correct numeric stats structure', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: true,
      profile: { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin', is_disabled: false },
    })
    setServiceResults(10, [{ coach_messages_count: 5 }, { credits: 3 }])

    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()

    // All stat fields should be numbers
    expect(typeof json.totalUsers).toBe('number')
    expect(typeof json.proUsers).toBe('number')
    expect(typeof json.freeUsers).toBe('number')
    expect(typeof json.teamUsers).toBe('number')
    expect(typeof json.totalDocuments).toBe('number')
    expect(typeof json.totalCoachMessages).toBe('number')
    expect(typeof json.totalCreditsHeld).toBe('number')
  })

  it('returns 403 when admin user is disabled', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: false,
      profile: { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin', is_disabled: true },
    })

    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns 429 when rate limit is exceeded', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: true,
      profile: { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin', is_disabled: false },
    })
    setServiceResults(0, [])

    // ADMIN_RATE_LIMIT: 60 requests per 60 seconds
    for (let i = 0; i < 60; i++) {
      const req = makeRequest(randomIP())
      await GET(req)
    }

    // 61st request should be rate limited (user-level rate limit keyed by user.id)
    const req = makeRequest(randomIP())
    const res = await GET(req)
    expect(res.status).toBe(429)
  })

  it('calls checkAdmin with the authenticated user', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({ isAdmin: false, profile: null })

    const req = makeRequest()
    await GET(req)

    expect(mockCheckAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ id: ADMIN_USER.id, email: ADMIN_USER.email })
    )
  })

  it('calculates freeUsers as totalUsers minus proUsers', async () => {
    setMockUser(ADMIN_USER)
    mockCheckAdmin.mockResolvedValue({
      isAdmin: true,
      profile: { id: ADMIN_USER.id, email: ADMIN_USER.email, role: 'admin', is_disabled: false },
    })
    setServiceResults(7, [])

    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()

    // Both totalUsers and proUsers come from the same mock returning count:7
    // so freeUsers = 7 - 7 = 0
    expect(json.freeUsers).toBe(json.totalUsers - json.proUsers)
  })
})
