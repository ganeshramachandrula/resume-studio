import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock variables (accessible in vi.mock factories) ────────

const { mockClient, mockAdminRpc, mockAdminClient, rateLimitCounts } = vi.hoisted(() => {
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

  // Track how many times check_rate_limit has been called per key
  const rateLimitCounts = new Map<string, number>()

  const mockAdminRpc = vi.fn().mockImplementation((fnName: string, args: Record<string, unknown>) => {
    if (fnName === 'check_rate_limit') {
      const key = args.p_key as string
      const max = args.p_max_requests as number
      const count = (rateLimitCounts.get(key) || 0) + 1
      rateLimitCounts.set(key, count)
      if (count > max) {
        return Promise.resolve({ data: { allowed: false, count, retry_after: args.p_window_seconds }, error: null })
      }
      return Promise.resolve({ data: { allowed: true, count }, error: null })
    }
    // Default: check_signup_allowed
    return Promise.resolve({ data: { allowed: true }, error: null })
  })

  const mockAdminClient = {
    rpc: mockAdminRpc,
    from: vi.fn(() => mockAdminClient),
    select: vi.fn(() => mockAdminClient),
    insert: vi.fn(() => mockAdminClient),
    eq: vi.fn(() => mockAdminClient),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  return { mockClient, mockAdminRpc, mockAdminClient, rateLimitCounts }
})

// ── Module mocks ────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

vi.mock('@/lib/security/audit-log', () => ({ logSecurityEvent: vi.fn() }))

// Mock @supabase/ssr's createServerClient to return our mock admin client
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockAdminClient),
}))

// ── Imports ─────────────────────────────────────────────────────────

import { POST } from '@/app/api/auth/check-signup/route'
import { __clearRateLimitStore } from '@/lib/security/rate-limit'

// ── Helpers ─────────────────────────────────────────────────────────

function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function makeRequest(body: unknown, ip?: string): Request {
  return new Request('http://localhost:5000/api/auth/check-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? randomIP(),
    },
    body: JSON.stringify(body),
  })
}

// ── Tests ───────────────────────────────────────────────────────────

describe('POST /api/auth/check-signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearRateLimitStore()
    rateLimitCounts.clear()
    // Restore default implementation (cleared by clearAllMocks)
    mockAdminRpc.mockImplementation((fnName: string, args: Record<string, unknown>) => {
      if (fnName === 'check_rate_limit') {
        const key = args.p_key as string
        const max = args.p_max_requests as number
        const count = (rateLimitCounts.get(key) || 0) + 1
        rateLimitCounts.set(key, count)
        if (count > max) {
          return Promise.resolve({ data: { allowed: false, count, retry_after: args.p_window_seconds }, error: null })
        }
        return Promise.resolve({ data: { allowed: true, count }, error: null })
      }
      return Promise.resolve({ data: { allowed: true }, error: null })
    })
  })

  it('returns 200 with allowed:true for first signup', async () => {
    const req = makeRequest({ deviceId: 'device-abc-123' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allowed).toBe(true)
  })

  it('returns 200 with allowed:true when deviceId is omitted', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allowed).toBe(true)
  })

  it('returns 403 with allowed:false when signup is blocked', async () => {
    mockAdminRpc.mockImplementation((fnName: string, args: Record<string, unknown>) => {
      if (fnName === 'check_rate_limit') {
        const key = args.p_key as string
        const max = args.p_max_requests as number
        const count = (rateLimitCounts.get(key) || 0) + 1
        rateLimitCounts.set(key, count)
        if (count > max) {
          return Promise.resolve({ data: { allowed: false, count, retry_after: args.p_window_seconds }, error: null })
        }
        return Promise.resolve({ data: { allowed: true, count }, error: null })
      }
      // check_signup_allowed → blocked
      return Promise.resolve({
        data: { allowed: false, reason: 'Too many accounts from this IP' },
        error: null,
      })
    })

    const req = makeRequest({ deviceId: 'device-blocked' })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.allowed).toBe(false)
    expect(json.reason).toContain('Too many accounts')
  })

  it('returns allowed:true when RPC returns an error (fail open)', async () => {
    mockAdminRpc.mockImplementation((fnName: string, args: Record<string, unknown>) => {
      if (fnName === 'check_rate_limit') {
        const key = args.p_key as string
        const max = args.p_max_requests as number
        const count = (rateLimitCounts.get(key) || 0) + 1
        rateLimitCounts.set(key, count)
        if (count > max) {
          return Promise.resolve({ data: { allowed: false, count, retry_after: args.p_window_seconds }, error: null })
        }
        return Promise.resolve({ data: { allowed: true, count }, error: null })
      }
      // check_signup_allowed → error (fail open)
      return Promise.resolve({
        data: null,
        error: { message: 'DB connection failed' },
      })
    })

    const req = makeRequest({ deviceId: 'device-err' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allowed).toBe(true)
  })

  it('returns 429 when rate limit is exceeded', async () => {
    const ip = randomIP()

    // SIGNUP_CHECK_RATE_LIMIT: 10 requests per 60 seconds
    for (let i = 0; i < 10; i++) {
      const req = makeRequest({}, ip)
      await POST(req)
    }

    // 11th should be rate limited
    const req = makeRequest({}, ip)
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('returns 400 for invalid JSON body', async () => {
    const ip = randomIP()
    const req = new Request('http://localhost:5000/api/auth/check-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: '{not valid json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid JSON')
  })

  it('returns 400 for deviceId exceeding 128 characters', async () => {
    const req = makeRequest({ deviceId: 'A'.repeat(129) })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid request')
  })

  it('calls check_signup_allowed RPC with IP and deviceId', async () => {
    const ip = randomIP()
    const req = makeRequest({ deviceId: 'my-device' }, ip)
    await POST(req)

    expect(mockAdminRpc).toHaveBeenCalledWith('check_signup_allowed', {
      p_ip: ip,
      p_device_id: 'my-device',
    })
  })
})
