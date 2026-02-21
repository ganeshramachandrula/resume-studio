'use client'

import { useMemo } from 'react'
import { FREE_DOCS_PER_MONTH, BASIC_DOCS_PER_MONTH, PRO_DOCS_PER_MONTH } from '@/lib/constants'
import type { Profile } from '@/types/database'

export function useUsage(profile: Profile | null) {
  const isPaid = profile?.plan === 'basic' || profile?.plan === 'pro'
  const usageCount = profile?.usage_count ?? 0
  const credits = profile?.credits ?? 0

  const limit = profile?.plan === 'pro'
    ? PRO_DOCS_PER_MONTH
    : profile?.plan === 'basic'
      ? BASIC_DOCS_PER_MONTH
      : FREE_DOCS_PER_MONTH

  const canGenerate = useMemo(() => {
    if (usageCount < limit) return true
    return credits > 0
  }, [usageCount, limit, credits])

  const remaining = Math.max(0, limit - usageCount) + credits

  return { usageCount, limit, canGenerate, remaining, isPaid, credits }
}
