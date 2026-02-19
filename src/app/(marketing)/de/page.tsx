import type { Metadata } from 'next'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: `${translations.de.hero.title} ${translations.de.hero.titleAccent}`,
  description: translations.de.hero.subtitle,
  alternates: { canonical: '/de' },
}

export default function GermanLandingPage() {
  return <TranslatedLanding t={translations.de} />
}
