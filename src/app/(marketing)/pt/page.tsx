import type { Metadata } from 'next'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export const metadata: Metadata = {
  title: `${translations.pt.hero.title} ${translations.pt.hero.titleAccent}`,
  description: translations.pt.hero.subtitle,
  alternates: { canonical: '/pt' },
}

export default function PortugueseLandingPage() {
  return <TranslatedLanding t={translations.pt} />
}
