import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || ''

export function isStripeConfigured(): boolean {
  return Boolean(stripeKey && stripeKey.startsWith('sk_') && stripeKey.length > 20)
}

export const stripe = isStripeConfigured()
  ? new Stripe(stripeKey, { apiVersion: '2026-01-28.clover' })
  : (null as unknown as Stripe)
