import { describe, it, expect, vi } from 'vitest'

// ── Mock ALL external dependencies that route files import at module level ──

// Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'no session' },
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

// Supabase SSR (used directly by some routes like webhook, check-signup, extension-login)
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      exchangeCodeForSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

// Stripe
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    customers: { create: vi.fn() },
    billingPortal: { sessions: { create: vi.fn() } },
    subscriptions: { retrieve: vi.fn() },
  },
  isStripeConfigured: () => false,
}))

// AI claude module
vi.mock('@/lib/ai/claude', () => ({
  generateJSONWithClaude: vi.fn(),
  generateWithClaude: vi.fn(),
  isAIConfigured: () => false,
  repairTruncatedJSON: vi.fn((s: string) => s),
}))

// Anthropic SDK (imported directly by career-coach route)
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'mock response' }],
        stop_reason: 'end_turn',
      }),
    },
  })),
}))

// Security modules
vi.mock('@/lib/security/audit-log', () => ({
  logSecurityEvent: vi.fn(),
}))

vi.mock('@/lib/security/device-session', () => ({
  registerDeviceSession: vi.fn().mockResolvedValue({ success: true, kicked: false }),
  isSessionValid: vi.fn().mockResolvedValue(false),
  heartbeatSession: vi.fn().mockResolvedValue(undefined),
  DEVICE_LIMITS: { free: 1, basic: 2, pro: 3 },
}))

// Admin module
vi.mock('@/lib/admin/check-admin', () => ({
  checkAdmin: vi.fn().mockResolvedValue({ isAdmin: false, profile: null }),
  getServiceClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

// AI prompt modules
vi.mock('@/lib/ai/prompts/parse-jd', () => ({
  PARSE_JD_SYSTEM: '',
  buildParseJDPrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-resume', () => ({
  GENERATE_RESUME_SYSTEM: '',
  buildGenerateResumePrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-cover-letter', () => ({
  GENERATE_COVER_LETTER_SYSTEM: '',
  buildCoverLetterPrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-linkedin', () => ({
  GENERATE_LINKEDIN_SYSTEM: '',
  buildLinkedInPrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-cold-email', () => ({
  GENERATE_COLD_EMAIL_SYSTEM: '',
  buildColdEmailPrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-interview-prep', () => ({
  GENERATE_INTERVIEW_PREP_SYSTEM: '',
  buildInterviewPrepPrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/generate-certification-guide', () => ({
  GENERATE_CERTIFICATION_GUIDE_SYSTEM: '',
  buildCertificationGuidePrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/ats-score', () => ({
  ATS_SCORE_SYSTEM: '',
  buildATSScorePrompt: vi.fn(),
}))
vi.mock('@/lib/ai/prompts/career-coach', () => ({
  CAREER_COACH_SYSTEM: '',
  buildCoachContextBlock: vi.fn().mockReturnValue(''),
}))
vi.mock('@/lib/ai/prompts/language-instruction', () => ({
  getLanguageInstruction: vi.fn().mockReturnValue(''),
}))

// AI mock responses
vi.mock('@/lib/ai/mock-responses', () => ({
  mockParsedJD: {},
  mockResumeData: {},
  mockCoverLetterData: {},
  mockLinkedInData: {},
  mockColdEmailData: {},
  mockInterviewPrepData: {},
  mockCertificationGuideData: {},
  mockATSScoreData: {},
  mockCoachResponse: 'mock coach response',
}))

// Job feed aggregator
vi.mock('@/lib/job-feed/aggregator', () => ({
  searchAllProviders: vi.fn().mockResolvedValue({ jobs: [], total: 0, cached: false }),
}))

// Node crypto (used by share route)
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('mock-token-abc123'),
    }),
  },
  randomBytes: vi.fn().mockReturnValue({
    toString: vi.fn().mockReturnValue('mock-token-abc123'),
  }),
}))

// ── Smoke Tests: Verify All Route Files Export Valid Handler Functions ──

describe('API Route Smoke Tests - Module Exports', () => {
  // ── AI Routes ──

  describe('AI Routes', () => {
    it('api/ai/parse-jd exports POST', async () => {
      const mod = await import('@/app/api/ai/parse-jd/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-resume exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-resume/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-cover-letter exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-cover-letter/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-linkedin exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-linkedin/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-cold-email exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-cold-email/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-interview-prep exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-interview-prep/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/generate-certification-guide exports POST', async () => {
      const mod = await import('@/app/api/ai/generate-certification-guide/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/ats-score exports POST', async () => {
      const mod = await import('@/app/api/ai/ats-score/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/career-coach exports POST', async () => {
      const mod = await import('@/app/api/ai/career-coach/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Career Coach Conversations ──

  describe('Career Coach Conversation Routes', () => {
    it('api/ai/career-coach/conversations exports GET', async () => {
      const mod = await import('@/app/api/ai/career-coach/conversations/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/ai/career-coach/conversations exports POST', async () => {
      const mod = await import('@/app/api/ai/career-coach/conversations/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/ai/career-coach/conversations/[id] exports GET', async () => {
      const mod = await import('@/app/api/ai/career-coach/conversations/[id]/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/ai/career-coach/conversations/[id] exports DELETE', async () => {
      const mod = await import('@/app/api/ai/career-coach/conversations/[id]/route')
      expect(typeof mod.DELETE).toBe('function')
    })
  })

  // ── Auth Routes ──

  describe('Auth Routes', () => {
    it('api/auth/callback exports GET', async () => {
      const mod = await import('@/app/api/auth/callback/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/auth/check-signup exports POST', async () => {
      const mod = await import('@/app/api/auth/check-signup/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/auth/extension-login exports POST', async () => {
      const mod = await import('@/app/api/auth/extension-login/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/auth/record-login-metadata exports POST', async () => {
      const mod = await import('@/app/api/auth/record-login-metadata/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/auth/record-signup-metadata exports POST', async () => {
      const mod = await import('@/app/api/auth/record-signup-metadata/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Stripe Routes ──

  describe('Stripe Routes', () => {
    it('api/stripe/create-checkout exports POST', async () => {
      const mod = await import('@/app/api/stripe/create-checkout/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/stripe/create-portal exports POST', async () => {
      const mod = await import('@/app/api/stripe/create-portal/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/stripe/webhook exports POST', async () => {
      const mod = await import('@/app/api/stripe/webhook/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Admin Routes ──

  describe('Admin Routes', () => {
    it('api/admin/bootstrap exports POST', async () => {
      const mod = await import('@/app/api/admin/bootstrap/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/admin/stats exports GET', async () => {
      const mod = await import('@/app/api/admin/stats/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/users exports GET', async () => {
      const mod = await import('@/app/api/admin/users/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/users/[id] exports GET', async () => {
      const mod = await import('@/app/api/admin/users/[id]/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/users/[id] exports PATCH', async () => {
      const mod = await import('@/app/api/admin/users/[id]/route')
      expect(typeof mod.PATCH).toBe('function')
    })

    it('api/admin/users/[id] exports DELETE', async () => {
      const mod = await import('@/app/api/admin/users/[id]/route')
      expect(typeof mod.DELETE).toBe('function')
    })

    it('api/admin/messages exports GET', async () => {
      const mod = await import('@/app/api/admin/messages/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/messages/[id] exports PATCH', async () => {
      const mod = await import('@/app/api/admin/messages/[id]/route')
      expect(typeof mod.PATCH).toBe('function')
    })

    it('api/admin/coach-usage exports GET', async () => {
      const mod = await import('@/app/api/admin/coach-usage/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/analytics exports GET', async () => {
      const mod = await import('@/app/api/admin/analytics/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/admin/analytics exports POST', async () => {
      const mod = await import('@/app/api/admin/analytics/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Support Routes ──

  describe('Support Routes', () => {
    it('api/support/contact exports POST', async () => {
      const mod = await import('@/app/api/support/contact/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Affiliate Routes ──

  describe('Affiliate Routes', () => {
    it('api/affiliate/track exports POST', async () => {
      const mod = await import('@/app/api/affiliate/track/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Referral Routes ──

  describe('Referral Routes', () => {
    it('api/referral exports GET', async () => {
      const mod = await import('@/app/api/referral/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/referral exports POST', async () => {
      const mod = await import('@/app/api/referral/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Share Routes ──

  describe('Share Routes', () => {
    it('api/share exports POST', async () => {
      const mod = await import('@/app/api/share/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/share exports GET', async () => {
      const mod = await import('@/app/api/share/route')
      expect(typeof mod.GET).toBe('function')
    })
  })

  // ── Device Session Routes ──

  describe('Device Session Routes', () => {
    it('api/device-session/register exports POST', async () => {
      const mod = await import('@/app/api/device-session/register/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/device-session/heartbeat exports POST', async () => {
      const mod = await import('@/app/api/device-session/heartbeat/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Document Routes ──

  describe('Document Routes', () => {
    it('api/documents/delete-application exports DELETE', async () => {
      const mod = await import('@/app/api/documents/delete-application/route')
      expect(typeof mod.DELETE).toBe('function')
    })
  })

  // ── Extension Routes ──

  describe('Extension Routes', () => {
    it('api/extension/submit-jd exports POST', async () => {
      const mod = await import('@/app/api/extension/submit-jd/route')
      expect(typeof mod.POST).toBe('function')
    })
  })

  // ── Job Feed Routes ──

  describe('Job Feed Routes', () => {
    it('api/jobs/search exports POST', async () => {
      const mod = await import('@/app/api/jobs/search/route')
      expect(typeof mod.POST).toBe('function')
    })

    it('api/jobs/preferences exports GET', async () => {
      const mod = await import('@/app/api/jobs/preferences/route')
      expect(typeof mod.GET).toBe('function')
    })

    it('api/jobs/preferences exports PUT', async () => {
      const mod = await import('@/app/api/jobs/preferences/route')
      expect(typeof mod.PUT).toBe('function')
    })
  })
})
