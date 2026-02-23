import type { Metadata } from 'next'
import { RoastContent } from '@/components/roast/roast-content'
import { translations } from '@/lib/i18n/translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'

const t = translations.fr.roastPage

export const metadata: Metadata = {
  title: `${t.title} — Resume Studio`,
  description: t.subtitle,
  alternates: {
    canonical: '/fr/roast',
    languages: hreflangAlternates('/roast'),
  },
}

export default function FrenchRoastPage() {
  return <RoastContent t={t} />
}
