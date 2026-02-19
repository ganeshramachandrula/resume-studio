import type { Metadata } from 'next'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: `${translations.hi.hero.title} ${translations.hi.hero.titleAccent}`,
  description: translations.hi.hero.subtitle,
  alternates: { canonical: '/hi' },
}

export default function HindiLandingPage() {
  return <TranslatedLanding t={translations.hi} />
}
