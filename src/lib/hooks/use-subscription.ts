'use client'

import { useMemo } from 'react'
import type { Profile } from '@/types/database'

export function useSubscription(profile: Profile | null) {
  const isPro = useMemo(() => {
    if (!profile) return false
    return profile.plan === 'pro_monthly' || profile.plan === 'pro_annual' || profile.plan === 'team'
  }, [profile])

  const isTeam = profile?.plan === 'team'
  const plan = profile?.plan ?? 'free'

  return { isPro, isTeam, plan }
}
