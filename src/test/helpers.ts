import type { Profile, Plan } from '@/types/database'

/**
 * Creates a mock Profile object for testing.
 */
export function createProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'test-user-id-123',
    email: 'test@example.com',
    plan: 'free' as Plan,
    usage_count: 0,
    usage_reset_at: new Date().toISOString(),
    credits: 0,
    team_id: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_period_start: null,
    subscription_period_end: null,
    role: 'user',
    is_disabled: false,
    saved_applications_count: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  } as Profile
}

/**
 * Creates a mock Request for testing API routes.
 */
export function createMockRequest(
  body: unknown,
  options: {
    method?: string
    headers?: Record<string, string>
    url?: string
  } = {}
): Request {
  const { method = 'POST', headers = {}, url = 'http://localhost:5000/api/test' } = options

  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)

  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
    body: method !== 'GET' ? bodyStr : undefined,
  })
}

/**
 * Creates a mock GET Request for testing.
 */
export function createMockGetRequest(
  url: string = 'http://localhost:5000/api/test',
  headers: Record<string, string> = {}
): Request {
  return new Request(url, {
    method: 'GET',
    headers: {
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
  })
}
