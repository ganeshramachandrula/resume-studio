import type { Metadata } from 'next'
import { GhostBoardContent } from '@/components/ghostboard/ghostboard-content'
import { translations } from '@/lib/i18n/translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'

const t = translations.de.ghostboardPage

export const metadata: Metadata = {
  title: `${t.metaTitle} | Resume Studio`,
  description: t.metaDescription,
  alternates: {
    canonical: '/de/ghostboard',
    languages: hreflangAlternates('/ghostboard'),
  },
}

export default function GermanGhostBoardPage() {
  return <GhostBoardContent />
}
