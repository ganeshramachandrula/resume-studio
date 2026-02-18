'use client'
import { TranslatedLanding } from '@/components/landing/translated-landing'
import { translations } from '@/lib/i18n/translations'

export default function PortugueseLandingPage() {
  return <TranslatedLanding t={translations.pt} />
}
