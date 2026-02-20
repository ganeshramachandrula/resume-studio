import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

/**
 * Returns a Supabase admin client (service role) for admin operations.
 * Bypasses RLS.
 */
export function getServiceClient() {
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

interface AdminCheckResult {
  isAdmin: boolean
  profile: { id: string; email: string; role: string; is_disabled: boolean } | null
}

/**
 * Checks if a user has admin role and is not disabled.
 * Uses service role client to bypass RLS.
 */
export async function checkAdmin(user: User): Promise<AdminCheckResult> {
  const supabase = getServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role, is_disabled')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return { isAdmin: false, profile: null }
  }

  if (profile.role !== 'admin' || profile.is_disabled) {
    return { isAdmin: false, profile }
  }

  return { isAdmin: true, profile }
}
