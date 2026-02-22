import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { isValidRedirect } from '@/lib/security/sanitize'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, AUTH_RATE_LIMIT } from '@/lib/security/rate-limit'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Resets failed login attempts for a user (fire-and-forget).
 */
async function resetFailedAttempts(userId: string) {
  try {
    const serviceSupabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
      { cookies: { getAll() { return [] }, setAll() {} } }
    )
    await serviceSupabase
      .from('profiles')
      .update({ failed_login_attempts: 0, locked_until: null })
      .eq('id', userId)
  } catch {
    // Don't fail the auth flow
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Rate limit auth callbacks by IP
  const ip = getClientIP(request)
  const rl = await checkRateLimitDistributed(ip, AUTH_RATE_LIMIT)
  if (!rl.allowed) {
    logSecurityEvent('rate_limit_hit', request, undefined, { route: 'auth/callback' })
    return rateLimitResponse(rl.retryAfterSeconds!)
  }

  // Validate redirect target — prevent open redirect
  const redirectPath = isValidRedirect(next) ? next : '/dashboard'
  if (redirectPath !== next) {
    logSecurityEvent('invalid_redirect_blocked', request, undefined, {
      attempted: next,
      redirected_to: redirectPath,
    })
  }

  const supabase = await createClient()

  // Flow 1: PKCE code exchange (OAuth + some email confirmations)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      logSecurityEvent('login_success', request, data.user.id)
      await resetFailedAttempts(data.user.id)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
    logSecurityEvent('login_failed', request, undefined, { error: 'code_exchange_failed' })
  }

  // Flow 2: Token hash verification (email confirmation, password recovery)
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error && data.user) {
      logSecurityEvent('login_success', request, data.user.id, { method: type })
      await resetFailedAttempts(data.user.id)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
    logSecurityEvent('login_failed', request, undefined, { error: 'token_verification_failed', type })
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
