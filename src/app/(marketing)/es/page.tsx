import type { Metadata } from 'next'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: `${translations.es.hero.title} ${translations.es.hero.titleAccent}`,
  description: translations.es.hero.subtitle,
  alternates: { canonical: '/es' },
}

export default function SpanishLandingPage() {
  return <TranslatedLanding t={translations.es} />
}
