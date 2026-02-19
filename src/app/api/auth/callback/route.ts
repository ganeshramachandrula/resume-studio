import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidRedirect } from '@/lib/security/sanitize'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, AUTH_RATE_LIMIT } from '@/lib/security/rate-limit'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
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

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      logSecurityEvent('login_success', request, data.user?.id)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
    logSecurityEvent('login_failed', request, undefined, { error: 'code_exchange_failed' })
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
