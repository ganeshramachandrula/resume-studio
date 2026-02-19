import type { Metadata } from 'next'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: `${translations.fr.hero.title} ${translations.fr.hero.titleAccent}`,
  description: translations.fr.hero.subtitle,
  alternates: { canonical: '/fr' },
}

export default function FrenchLandingPage() {
  return <TranslatedLanding t={translations.fr} />
}
