import type { Profile } from '@/types/database'

/** User is on any Pro plan (monthly or annual) */
export function isPro(profile: Profile | null): boolean {
  return profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual'
}

/** User is on the Pro Annual plan specifically */
export function isAnnual(profile: Profile | null): boolean {
  return profile?.plan === 'pro_annual'
}
