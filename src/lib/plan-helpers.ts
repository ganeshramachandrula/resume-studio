import type { Profile } from '@/types/database'

/** User is on any Pro plan (monthly, annual, or team) */
export function isPro(profile: Profile | null): boolean {
  return profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual' || profile?.plan === 'team'
}

/** User is on Pro Annual or Team plan (both get annual-exclusive features) */
export function isAnnual(profile: Profile | null): boolean {
  return profile?.plan === 'pro_annual' || profile?.plan === 'team'
}

/** User has purchasable credits remaining */
export function hasCredits(profile: Profile | null): boolean {
  return (profile?.credits ?? 0) > 0
}

/** User can save documents (pro/team user, or free user with credits) */
export function canSave(profile: Profile | null): boolean {
  return isPro(profile) || hasCredits(profile)
}
