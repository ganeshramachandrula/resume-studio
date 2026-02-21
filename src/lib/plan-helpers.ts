import type { Profile } from '@/types/database'

/** User is on the Pro plan (top tier — career coach, multi-language, premium fonts) */
export function isPro(profile: Profile | null): boolean {
  return profile?.plan === 'pro'
}

/** User is on any paid plan (Basic or Pro) */
export function isPaid(profile: Profile | null): boolean {
  return profile?.plan === 'basic' || profile?.plan === 'pro'
}

/** User has purchasable credits remaining */
export function hasCredits(profile: Profile | null): boolean {
  return (profile?.credits ?? 0) > 0
}

/** User can save documents (paid user, or free user with credits) */
export function canSave(profile: Profile | null): boolean {
  return isPaid(profile) || hasCredits(profile)
}
