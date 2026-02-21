import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServerClient } from '@supabase/ssr'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse } from '@/lib/security/rate-limit'

// Webhooks need a higher rate limit — Stripe sends many events per checkout
const WEBHOOK_RATE_LIMIT = { maxRequests: 100, windowSeconds: 60 }
import { logSecurityEvent } from '@/lib/security/audit-log'

// Use service role key to bypass RLS
function getAdminClient() {
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

/** Check if a webhook event was already processed (DB-backed dedup) */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('processed_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .limit(1)
  return !!data?.length
}

/** Mark a webhook event as processed (DB-backed dedup) */
async function markEventProcessed(eventId: string): Promise<void> {
  const supabase = getAdminClient()
  await supabase
    .from('processed_webhook_events')
    .upsert({ event_id: eventId }, { onConflict: 'event_id' })
}

/** Map a Stripe price ID to a plan name, including legacy price IDs */
function priceIdToPlan(priceId: string): 'basic' | 'pro' | 'free' {
  // Current price IDs
  if (priceId === process.env.STRIPE_BASIC_MONTHLY_PRICE_ID) return 'basic'
  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID) return 'pro'
  // Legacy price IDs for existing subscribers
  if (priceId === process.env.STRIPE_LEGACY_PRO_MONTHLY_PRICE_ID) return 'basic'
  if (priceId === process.env.STRIPE_LEGACY_PRO_ANNUAL_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_LEGACY_TEAM_PRICE_ID) return 'pro'
  return 'free'
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const rl = await checkRateLimitDistributed(`webhook_${ip}`, WEBHOOK_RATE_LIMIT)
    if (!rl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'webhook' })
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: unknown) {
      console.error('[webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Idempotency check (DB-backed, persists across serverless instances)
    if (await isEventProcessed(event.id)) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    logSecurityEvent('webhook_received', request, undefined, {
      event_type: event.type,
      event_id: event.id,
    })

    const supabase = getAdminClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const metadataType = session.metadata?.type

        // Credit pack: one-time payment, no subscription
        if (metadataType === 'credit_pack') {
          const userId = session.metadata?.supabase_user_id
          if (userId) {
            await supabase.rpc('add_credits', { user_uuid: userId, credit_amount: 3 })
          }
          break
        }

        // Regular subscription (basic/pro)
        if (!session.subscription) break
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0].price.id
        const plan = priceIdToPlan(priceId)

        await supabase
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            subscription_period_start: new Date(subscription.items.data[0].current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
          })
          .eq('id', session.metadata?.supabase_user_id)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const priceId = subscription.items.data[0].price.id
        const plan = priceIdToPlan(priceId)

        await supabase
          .from('profiles')
          .update({
            plan,
            subscription_period_start: new Date(subscription.items.data[0].current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object

        await supabase
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'invoice.payment_failed': {
        logSecurityEvent('webhook_received', request, undefined, { event: 'payment_failed' })
        break
      }
    }

    markEventProcessed(event.id)

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'webhook')
  }
}
