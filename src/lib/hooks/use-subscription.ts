'use client'

import { useMemo } from 'react'
import type { Profile } from '@/types/database'

export function useSubscription(profile: Profile | null) {
  const isPaid = useMemo(() => {
    if (!profile) return false
    return profile.plan === 'basic' || profile.plan === 'pro'
  }, [profile])

  const isPro = profile?.plan === 'pro'
  const plan = profile?.plan ?? 'free'

  return { isPaid, isPro, plan }
}
