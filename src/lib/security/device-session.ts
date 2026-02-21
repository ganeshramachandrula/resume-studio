import { getServiceClient } from '@/lib/admin/check-admin'
import { logSecurityEvent } from '@/lib/security/audit-log'
import type { Plan } from '@/types/database'

/** Maximum concurrent devices per plan */
export const DEVICE_LIMITS: Record<Plan, number> = {
  free: 1,
  basic: 2,
  pro: 3,
}

interface RegisterResult {
  success: boolean
  kicked: boolean
  kicked_device_id?: string
}

/**
 * Registers a device session for a user. Atomic: cleans up stale sessions,
 * kicks the oldest if over the plan's device limit.
 */
export async function registerDeviceSession(
  userId: string,
  deviceId: string,
  deviceLabel: string,
  plan: Plan,
  request?: Request
): Promise<RegisterResult> {
  const supabase = getServiceClient()
  const maxDevices = DEVICE_LIMITS[plan] ?? 1

  const { data, error } = await supabase.rpc('register_device_session', {
    p_user_id: userId,
    p_device_id: deviceId,
    p_device_label: deviceLabel,
    p_max_devices: maxDevices,
  })

  if (error) {
    console.error('[device-session] register error:', error.message)
    return { success: false, kicked: false }
  }

  const result = data as RegisterResult

  // Log if a session was kicked
  if (result.kicked && request) {
    logSecurityEvent('concurrent_session_exceeded', request, userId, {
      kicked_device_id: result.kicked_device_id,
      new_device_id: deviceId,
      plan,
      max_devices: maxDevices,
    })
  }

  return result
}

/**
 * Updates the last_active_at timestamp for a device session.
 * Fire-and-forget — does not throw.
 */
export async function heartbeatSession(userId: string, deviceId: string): Promise<void> {
  try {
    const supabase = getServiceClient()
    await supabase
      .from('device_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
  } catch (err) {
    console.error('[device-session] heartbeat error:', err)
  }
}

/**
 * Checks if a device session is still valid (exists and active within 30 min).
 */
export async function isSessionValid(userId: string, deviceId: string): Promise<boolean> {
  const supabase = getServiceClient()

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('device_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .gte('last_active_at', thirtyMinAgo)
    .limit(1)
    .single()

  if (error || !data) return false
  return true
}
