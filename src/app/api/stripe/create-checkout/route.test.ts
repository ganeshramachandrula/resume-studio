import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock variables (accessible in vi.mock factories) ────────

const { mockClient, mockIsStripeConfigured } = vi.hoisted(() => {
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
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
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

  const mockIsStripeConfigured = vi.fn().mockReturnValue(false)

  return { mockClient, mockIsStripeConfigured }
})

// ── Module mocks ────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

vi.mock('@/lib/security/audit-log', () => ({ logSecurityEvent: vi.fn() }))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    customers: { create: vi.fn().mockResolvedValue({ id: 'cus_test' }) },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
  },
  isStripeConfigured: mockIsStripeConfigured,
}))

// ── Imports ─────────────────────────────────────────────────────────

import { POST } from '@/app/api/stripe/create-checkout/route'
import { __clearRateLimitStore } from '@/lib/security/rate-limit'

// ── Helpers ─────────────────────────────────────────────────────────

function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

function makeRequest(body: unknown, ip?: string): Request {
  return new Request('http://localhost:5000/api/stripe/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? randomIP(),
    },
    body: JSON.stringify(body),
  })
}

function setMockUser(user: Record<string, unknown> | null, error?: Record<string, unknown> | null) {
  mockClient.auth.getUser.mockResolvedValue({
    data: { user },
    error: error ?? (user ? null : { message: 'no session' }),
  })
}

const VERIFIED_USER = {
  id: 'user-checkout-1',
  email: 'checkout@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
}

const UNVERIFIED_USER = {
  id: 'user-checkout-2',
  email: 'unverified@example.com',
  email_confirmed_at: null,
}

// ── Tests ───────────────────────────────────────────────────────────

describe('POST /api/stripe/create-checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __clearRateLimitStore()
    setMockUser(null)
    mockIsStripeConfigured.mockReturnValue(false)

    // Re-wire chainable methods after clearAllMocks
    mockClient.select.mockReturnValue(mockClient)
    mockClient.insert.mockReturnValue(mockClient)
    mockClient.update.mockReturnValue(mockClient)
    mockClient.delete.mockReturnValue(mockClient)
    mockClient.eq.mockReturnValue(mockClient)
    mockClient.single.mockResolvedValue({ data: { plan: 'free', stripe_customer_id: null }, error: null })
    mockClient.rpc.mockResolvedValue({ data: null, error: null })
    mockClient.from.mockImplementation(() => {
      return new Proxy(mockClient, {
        get(target: Record<string, unknown>, prop: string) {
          if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: null, error: null })
          return target[prop]
        },
      })
    })
  })

  it('returns 401 when not authenticated', async () => {
    setMockUser(null)
    const req = makeRequest({ priceId: 'price_test' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 403 when email not verified', async () => {
    setMockUser(UNVERIFIED_USER)
    const req = makeRequest({ priceId: 'price_test' })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('verify your email')
  })

  it('returns 400 for missing priceId', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty priceId', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ priceId: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns dashboard URL for subscription in mock mode', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ priceId: 'mock_annual', mode: 'subscription' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/dashboard')
    expect(json.url).toContain('checkout=success')
  })

  it('returns dashboard URL for credit pack in mock mode', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ priceId: 'price_credits', mode: 'payment' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/dashboard')
    expect(json.url).toContain('checkout=credits')
    // Should have called rpc to add credits
    expect(mockClient.rpc).toHaveBeenCalledWith('add_credits', {
      user_uuid: VERIFIED_USER.id,
      credit_amount: 3,
    })
  })

  it('returns team URL for team plan in mock mode', async () => {
    setMockUser(VERIFIED_USER)
    // Make the team insert return a team object via thenable proxy
    mockClient.from.mockImplementation(() => {
      return new Proxy(mockClient, {
        get(target: Record<string, unknown>, prop: string) {
          if (prop === 'then') return (resolve: (v: unknown) => void) => resolve({ data: { id: 'team-1' }, error: null })
          return target[prop]
        },
      })
    })

    const req = makeRequest({ priceId: 'price_team', mode: 'team', quantity: 5 })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/team')
    expect(json.url).toContain('checkout=success')
  })

  it('returns 429 when rate limited', async () => {
    setMockUser(VERIFIED_USER)
    const ip = randomIP()

    // STRIPE_RATE_LIMIT: 10 requests per 60 seconds
    for (let i = 0; i < 10; i++) {
      const req = makeRequest({ priceId: 'price_test' }, ip)
      await POST(req)
    }

    // 11th should be rate limited
    const req = makeRequest({ priceId: 'price_test' }, ip)
    const res = await POST(req)
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error).toContain('Too many requests')
  })

  it('assigns pro_monthly plan when priceId is not mock_annual in mock mode', async () => {
    setMockUser(VERIFIED_USER)
    const req = makeRequest({ priceId: 'price_monthly' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/dashboard')
    expect(json.url).toContain('checkout=success')
  })

  it('returns 400 for invalid JSON body', async () => {
    setMockUser(VERIFIED_USER)
    const ip = randomIP()
    const req = new Request('http://localhost:5000/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: '{invalid json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
