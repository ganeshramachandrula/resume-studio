'use client'

import { useMemo } from 'react'
import type { Profile } from '@/types/database'

export function useSubscription(profile: Profile | null) {
  const isPro = useMemo(() => {
    if (!profile) return false
    return profile.plan === 'pro_monthly' || profile.plan === 'pro_annual'
  }, [profile])

  const plan = profile?.plan ?? 'free'

  return { isPro, plan }
}
