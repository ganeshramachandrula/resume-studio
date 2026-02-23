import type { Metadata } from 'next'
import { RoastContent } from '@/components/roast/roast-content'
import { translations } from '@/lib/i18n/translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'

const t = translations.es.roastPage

export const metadata: Metadata = {
  title: `${t.title} — Resume Studio`,
  description: t.subtitle,
  alternates: {
    canonical: '/es/roast',
    languages: hreflangAlternates('/roast'),
  },
}

export default function SpanishRoastPage() {
  return <RoastContent t={t} />
}
