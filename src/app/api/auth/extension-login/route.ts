import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimitDistributed, getClientIP, AUTH_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email').max(300),
  password: z.string().min(6, 'Password too short').max(200),
})

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, AUTH_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'extension-login' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation failed' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { email, password } = parsed.data

    // Service role client for lockout checks
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    // Check account lockout
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('id, failed_login_attempts, locked_until')
      .eq('email', email)
      .single()

    if (profile?.locked_until && new Date(profile.locked_until) > new Date()) {
      const retryAfter = Math.ceil((new Date(profile.locked_until).getTime() - Date.now()) / 1000)
      logSecurityEvent('account_locked', request, profile.id, { route: 'extension-login', email })
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again later.', retry_after: retryAfter },
        { status: 423, headers: CORS_HEADERS }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      // Increment failed login attempts
      if (profile) {
        const newCount = (profile.failed_login_attempts || 0) + 1
        const updateData: Record<string, unknown> = { failed_login_attempts: newCount }
        if (newCount >= 5) {
          updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
        await serviceSupabase.from('profiles').update(updateData).eq('id', profile.id)
      }
      logSecurityEvent('login_failed', request, undefined, { route: 'extension-login', email })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    // Reset failed attempts on success
    if (profile) {
      await serviceSupabase
        .from('profiles')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('id', data.user.id)
    }

    logSecurityEvent('login_success', request, data.user.id, { route: 'extension-login' })

    return NextResponse.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: unknown) {
    return safeErrorResponse(error, 'extension-login')
  }
}
