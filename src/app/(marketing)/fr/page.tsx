'use client'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export default function FrenchLandingPage() {
  return <TranslatedLanding t={translations.fr} />
}
