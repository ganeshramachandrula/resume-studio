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

// Idempotency: track processed event IDs to prevent duplicate processing.
// In production, use DB-backed deduplication instead of in-memory.
const processedEvents = new Set<string>()
const MAX_PROCESSED_EVENTS = 10_000

function markEventProcessed(eventId: string) {
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    // Clear oldest half to prevent unbounded growth
    const entries = Array.from(processedEvents)
    for (let i = 0; i < entries.length / 2; i++) {
      processedEvents.delete(entries[i])
    }
  }
  processedEvents.add(eventId)
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

    // Idempotency check
    if (processedEvents.has(event.id)) {
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

        // Team plan: create team + set plan
        if (metadataType === 'team') {
          const userId = session.metadata?.supabase_user_id
          const seatCount = parseInt(session.metadata?.seat_count || '5', 10)
          if (userId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )
            const { data: team } = await supabase
              .from('teams')
              .insert({
                name: 'My Team',
                admin_user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscription.id,
                seat_count: seatCount,
              })
              .select()
              .single()

            if (team) {
              await supabase
                .from('profiles')
                .update({
                  plan: 'team',
                  team_id: team.id,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: session.customer as string,
                  subscription_period_start: new Date(subscription.items.data[0].current_period_start * 1000).toISOString(),
                  subscription_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
                })
                .eq('id', userId)
            }
          }
          break
        }

        // Regular subscription (pro monthly/annual)
        if (!session.subscription) break
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0].price.id

        const plan =
          priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID
            ? 'pro_monthly'
            : priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
              ? 'pro_annual'
              : 'free'

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

        // Check if this is a team subscription
        if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
          const newQuantity = subscription.items.data[0].quantity || 5
          // Update seat count on teams table
          await supabase
            .from('teams')
            .update({ seat_count: newQuantity })
            .eq('stripe_subscription_id', subscription.id)
          break
        }

        const plan =
          priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID
            ? 'pro_monthly'
            : priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
              ? 'pro_annual'
              : 'free'

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
        const priceId = subscription.items.data[0].price.id

        // Team subscription cancelled: downgrade all members + delete team
        if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
          const { data: team } = await supabase
            .from('teams')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (team) {
            // Downgrade all team members to free
            await supabase
              .from('profiles')
              .update({ plan: 'free', team_id: null, stripe_subscription_id: null })
              .eq('team_id', team.id)

            // Delete the team
            await supabase.from('teams').delete().eq('id', team.id)
          }
          break
        }

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
