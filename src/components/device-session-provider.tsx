'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'

const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Registers the current device on mount and runs a 5-minute heartbeat.
 * If the session is invalidated (kicked by another device), signs out and redirects.
 * Renders children immediately — never blocks rendering.
 */
export function DeviceSessionProvider({ children }: { children: React.ReactNode }) {
  const profile = useAppStore((s) => s.profile)
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const deviceIdRef = useRef<string | null>(null)
  const registeredRef = useRef(false)

  useEffect(() => {
    if (!profile?.id) return

    let cancelled = false

    async function register() {
      try {
        // Dynamic import to avoid SSR issues with localStorage/canvas
        const { getDeviceFingerprint, getDeviceLabel } = await import('@/lib/security/fingerprint')
        const deviceId = await getDeviceFingerprint()
        const deviceLabel = getDeviceLabel()
        deviceIdRef.current = deviceId

        if (cancelled) return

        const res = await fetch('/api/device-session/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, deviceLabel }),
        })

        if (!res.ok && res.status === 401) {
          // Not authenticated — skip silently
          return
        }

        registeredRef.current = true
      } catch (err) {
        console.error('[device-session] register failed:', err)
      }
    }

    register()

    return () => {
      cancelled = true
    }
  }, [profile?.id])

  useEffect(() => {
    if (!registeredRef.current && !deviceIdRef.current) return
    if (!profile?.id) return

    async function heartbeat() {
      const deviceId = deviceIdRef.current
      if (!deviceId) return

      try {
        const res = await fetch('/api/device-session/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        })

        if (!res.ok) return

        const data = await res.json()

        if (data.valid === false) {
          // Session was kicked — sign out and redirect
          const supabase = createClient()
          await supabase.auth.signOut()
          router.push('/login?error=session_expired')
        }
      } catch {
        // Network error — skip silently, retry next interval
      }
    }

    // Start heartbeat interval
    intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [profile?.id, router])

  return <>{children}</>
}
