import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe/server'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, createCheckoutSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, STRIPE_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, STRIPE_RATE_LIMIT)
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
    const userRl = await checkRateLimitDistributed(user.id, STRIPE_RATE_LIMIT)
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

    const { priceId: rawPriceId, plan, mode = 'subscription' } = body

    // Resolve plan name to price ID if plan was provided instead of priceId
    const PLAN_PRICE_MAP: Record<string, string | undefined> = {
      basic: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      credits: process.env.STRIPE_CREDIT_PACK_PRICE_ID,
    }
    const priceId = rawPriceId || (plan ? PLAN_PRICE_MAP[plan] : undefined)
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID or plan is required' }, { status: 400 })
    }

    // Mock mode: simulate upgrade without real Stripe
    if (!isStripeConfigured()) {
      if (mode === 'payment') {
        // Mock credit pack purchase
        await supabase.rpc('add_credits', { user_uuid: user.id, credit_amount: 3 })
        logSecurityEvent('checkout_initiated', request, user.id, { mode: 'mock', type: 'credit_pack' })
        return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=credits` })
      }
      const mockPlan = priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID ? 'pro' : 'basic'
      await supabase
        .from('profiles')
        .update({ plan: mockPlan, stripe_customer_id: 'mock_cus_' + user.id.slice(0, 8) })
        .eq('id', user.id)
      logSecurityEvent('checkout_initiated', request, user.id, { mode: 'mock', plan: mockPlan })
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success` })
    }

    // Verify priceId matches an allowed price
    const allowedPrices = [
      process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_CREDIT_PACK_PRICE_ID,
    ].filter(Boolean)

    if (allowedPrices.length === 0) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (!allowedPrices.includes(priceId)) {
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

    // Credit pack: one-time payment
    if (mode === 'payment') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        // automatic_tax: { enabled: true },
        // customer_update: { address: 'auto' },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=credits`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        metadata: { supabase_user_id: user.id, type: 'credit_pack' },
      })
      logSecurityEvent('checkout_initiated', request, user.id, { mode: 'live', type: 'credit_pack' })
      return NextResponse.json({ url: session.url })
    }

    // Regular subscription (basic/pro)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // automatic_tax: { enabled: true },
      // customer_update: { address: 'auto' },
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
