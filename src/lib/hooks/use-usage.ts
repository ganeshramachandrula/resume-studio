'use client'

import { useMemo } from 'react'
import { FREE_DOCS_PER_MONTH } from '@/lib/constants'
import type { Profile } from '@/types/database'

export function useUsage(profile: Profile | null) {
  const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual' || profile?.plan === 'team'
  const usageCount = profile?.usage_count ?? 0
  const credits = profile?.credits ?? 0
  const limit = isPro ? Infinity : FREE_DOCS_PER_MONTH

  const canGenerate = useMemo(() => {
    if (isPro) return true
    if (usageCount < FREE_DOCS_PER_MONTH) return true
    return credits > 0
  }, [isPro, usageCount, credits])

  const remaining = isPro ? Infinity : Math.max(0, FREE_DOCS_PER_MONTH - usageCount) + credits

  return { usageCount, limit, canGenerate, remaining, isPro, credits }
}
