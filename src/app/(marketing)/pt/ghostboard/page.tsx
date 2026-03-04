import type { Metadata } from 'next'
import { GhostBoardContent } from '@/components/ghostboard/ghostboard-content'
import { translations } from '@/lib/i18n/translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'

const t = translations.pt.ghostboardPage

export const metadata: Metadata = {
  title: `${t.metaTitle} | Resume Studio`,
  description: t.metaDescription,
  alternates: {
    canonical: '/pt/ghostboard',
    languages: hreflangAlternates('/ghostboard'),
  },
}

export default function PortugueseGhostBoardPage() {
  return <GhostBoardContent />
}
