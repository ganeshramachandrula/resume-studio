'use client'

import { useState } from 'react'
import { Check, Crown, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'

const plans = [
  {
    key: 'basic',
    name: 'Basic',
    price: '$5.99',
    period: '/month',
    description: 'For active job seekers',
    mode: 'subscription',
    features: [
      '10 documents/month',
      'All 13 templates',
      'No watermark',
      'Save up to 10 applications',
      'Advanced ATS analysis',
      'Job tracker',
    ],
    popular: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$10.99',
    period: '/month',
    description: 'For serious job seekers',
    mode: 'subscription',
    features: [
      '20 documents/month',
      'All 13 templates',
      'Premium fonts',
      'Multi-language support',
      'Career Coach',
      'No watermark',
    ],
    popular: true,
  },
]

export default function UpgradePage() {
  const { profile } = useAppStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (planKey: string, mode: string) => {
    setLoadingPlan(planKey)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, mode }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoadingPlan(null)
  }

  const isPaid = profile?.plan && profile.plan !== 'free'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-500 mt-1">
          {isPaid
            ? `You're currently on the ${profile?.plan === 'pro' ? 'Pro' : 'Basic'} plan.`
            : 'Choose a plan to unlock more features.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={`relative ${
              plan.popular ? 'border-2 border-accent shadow-lg' : 'border border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              <div>
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
                <p className="text-xs text-gray-400 mt-1">+ applicable tax</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'accent' : 'default'}
                disabled={loadingPlan === plan.key || profile?.plan === plan.key}
                onClick={() => handleCheckout(plan.key, plan.mode)}
              >
                {loadingPlan === plan.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                {profile?.plan === plan.key ? 'Current Plan' : `Get ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit Pack */}
      <Card className="border border-gray-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Need just a few more?</h3>
              <p className="text-xs text-gray-500">3 document generations for $2.99 — no watermark, saved to your account. Credits never expire.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="accent"
            disabled={loadingPlan === 'credits'}
            onClick={() => handleCheckout('credits', 'payment')}
          >
            {loadingPlan === 'credits' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            Buy Credits
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
