'use client'

import { RoastContent } from '@/components/roast/roast-content'
import { englishRoastPage } from '@/lib/i18n/translations'

export default function RoastPage() {
  return <RoastContent t={englishRoastPage} />
}
