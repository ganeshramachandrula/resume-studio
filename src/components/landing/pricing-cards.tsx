'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { detectLocalCurrency, formatLocalPrice } from '@/lib/i18n/currencies'

const plans = [
  {
    name: 'Free',
    price: '$0',
    usdAmount: 0,
    period: '/month',
    description: 'Perfect for trying it out',
    features: [
      '2 documents per month',
      'Basic ATS score',
      'PDF download (watermarked)',
      '3 resume templates',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$5.99',
    usdAmount: 5.99,
    period: '/month',
    description: 'For active job seekers',
    features: [
      '10 documents/month',
      'All 13 templates',
      'No watermark',
      'Save up to 10 applications',
      'Advanced ATS analysis',
      'Job tracker',
    ],
    cta: 'Go Basic',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$10.99',
    usdAmount: 10.99,
    period: '/month',
    description: 'For serious job seekers',
    features: [
      '20 documents/month',
      'All 13 templates',
      'Premium fonts',
      'Multi-language support',
      'Career Coach',
      'No watermark',
    ],
    cta: 'Go Pro',
    href: '/signup',
    popular: true,
  },
]

export function PricingCards() {
  const [localCurrency, setLocalCurrency] = useState<ReturnType<typeof detectLocalCurrency>>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only API on mount
  useEffect(() => { setLocalCurrency(detectLocalCurrency()) }, [])

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
          {localCurrency && (
            <p className="text-gray-500 text-sm mt-2">
              Prices shown in USD. Approximate {localCurrency.code} equivalents shown below.
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-b from-brand/20 to-accent/10 border-2 border-accent/40'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1 font-[family-name:var(--font-body)]">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
                {plan.usdAmount > 0 && (
                  <p className="text-gray-500 text-xs mt-1">+ applicable tax</p>
                )}
                {localCurrency && plan.usdAmount > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    {formatLocalPrice(plan.usdAmount, localCurrency)}{plan.period}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'accent' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Credit Pack — subtle, below main pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mt-6"
        >
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm font-[family-name:var(--font-body)]">Need just a few more?</h3>
                <p className="text-gray-400 text-xs">3 document generations for $2.99 — no watermark, saved to your account. Credits never expire.</p>
              </div>
            </div>
            <Link href="/signup">
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10 shrink-0">Buy Credits</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
