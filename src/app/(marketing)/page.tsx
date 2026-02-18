'use client'

import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ATSPreview } from '@/components/landing/ats-preview'
import { Testimonials } from '@/components/landing/testimonials'
import { PricingCards } from '@/components/landing/pricing-cards'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { JsonLd } from '@/components/landing/json-ld'

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Features />
      <HowItWorks />
      <ATSPreview />
      <Testimonials />
      <PricingCards />
      <FAQ />
      <FinalCTA />
    </>
  )
}
