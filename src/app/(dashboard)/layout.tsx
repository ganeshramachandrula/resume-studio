'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DeviceSessionProvider } from '@/components/device-session-provider'
import type { Profile } from '@/types/database'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setProfile } = useAppStore()

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
        if (data) setProfile(data as Profile)
      }
    }
    loadProfile()
  }, [setProfile])

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
