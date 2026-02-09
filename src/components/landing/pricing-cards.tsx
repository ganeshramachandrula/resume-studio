'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying it out',
    features: [
      '2 documents per month',
      'Basic ATS score',
      'PDF download',
      '3 resume templates',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    description: 'For active job seekers',
    features: [
      'Unlimited documents',
      'All templates',
      'Full application package',
      'Advanced ATS analysis',
      'Job tracker',
      'Interview prep',
      'No ads',
    ],
    cta: 'Go Pro',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Pro Annual',
    price: '$79',
    period: '/year',
    description: 'Best value — save 34%',
    features: [
      'Everything in Pro',
      'Priority generation',
      'Career Coach',
      'Multi-language support',
      'Premium templates',
    ],
    cta: 'Go Pro Annual',
    href: '/signup',
    popular: false,
  },
]

export function PricingCards() {
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
      </div>
    </section>
  )
}
