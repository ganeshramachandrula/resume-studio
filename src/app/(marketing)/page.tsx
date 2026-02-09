'use client'

import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ATSPreview } from '@/components/landing/ats-preview'
import { PricingCards } from '@/components/landing/pricing-cards'
import { FinalCTA } from '@/components/landing/final-cta'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <ATSPreview />
      <PricingCards />
      <FinalCTA />
    </>
  )
}
