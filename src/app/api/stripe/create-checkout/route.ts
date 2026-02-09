import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/server'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, createCheckoutSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, STRIPE_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, STRIPE_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'create-checkout' })
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
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'create-checkout' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'create-checkout' })
      return NextResponse.json(
        { error: 'Please verify your email address before upgrading.' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, createCheckoutSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'create-checkout' })
      return body
    }

    const { priceId } = body

    // Mock mode: simulate upgrade without real Stripe
    if (!isStripeConfigured()) {
      const plan = priceId === 'mock_annual' ? 'pro_annual' : 'pro_monthly'
      await supabase
        .from('profiles')
        .update({ plan, stripe_customer_id: 'mock_cus_' + user.id.slice(0, 8) })
        .eq('id', user.id)
      logSecurityEvent('checkout_initiated', request, user.id, { mode: 'mock', plan })
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success` })
    }

    // Verify priceId matches an allowed price
    const allowedPrices = [
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    ].filter(Boolean)

    if (allowedPrices.length > 0 && !allowedPrices.includes(priceId)) {
      logSecurityEvent('validation_error', request, user.id, {
        route: 'create-checkout',
        reason: 'invalid_price_id',
      })
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: { supabase_user_id: user.id },
    })

    logSecurityEvent('checkout_initiated', request, user.id, { mode: 'live', priceId })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'create-checkout')
  }
}
