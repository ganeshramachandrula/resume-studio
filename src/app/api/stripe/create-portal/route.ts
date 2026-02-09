import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, getClientIP, rateLimitResponse, STRIPE_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, STRIPE_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'create-portal' })
      return rateLimitResponse(ipRl.retryAfterSeconds!)
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by user ID
    const userRl = checkRateLimit(user.id, STRIPE_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'create-portal' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Mock mode: redirect back to settings
    if (!isStripeConfigured()) {
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/settings` })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'create-portal')
  }
}
