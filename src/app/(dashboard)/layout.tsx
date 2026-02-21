'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DeviceSessionProvider } from '@/components/device-session-provider'
import { isPasswordExpired } from '@/lib/security/password'
import type { Profile } from '@/types/database'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setProfile } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) {
          setProfile(data as Profile)
          // Check password expiry — redirect to change-password page
          if (isPasswordExpired((data as Profile).password_changed_at)) {
            router.push('/change-password')
          }
        }
      }
    }
    loadProfile()
  }, [setProfile, router])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <DeviceSessionProvider>{children}</DeviceSessionProvider>
        </main>
      </div>
    </div>
  )
}
