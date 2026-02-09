'use client'

import { useMemo } from 'react'
import { FREE_DOCS_PER_MONTH } from '@/lib/constants'
import type { Profile } from '@/types/database'

export function useUsage(profile: Profile | null) {
  const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual'
  const usageCount = profile?.usage_count ?? 0
  const limit = isPro ? Infinity : FREE_DOCS_PER_MONTH

  const canGenerate = useMemo(() => {
    if (isPro) return true
    return usageCount < FREE_DOCS_PER_MONTH
  }, [isPro, usageCount])

  const remaining = isPro ? Infinity : Math.max(0, FREE_DOCS_PER_MONTH - usageCount)

  return { usageCount, limit, canGenerate, remaining, isPro }
}
