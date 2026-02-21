'use client'

import { Menu, Bell } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Badge } from '@/components/ui/badge'

export function MobileNav() {
  const { profile, setSidebarOpen } = useAppStore()
  const isPro = profile?.plan === 'basic' || profile?.plan === 'pro'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          {!isPro && (
            <Badge variant="accent" className="text-xs">
              Free
            </Badge>
          )}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="h-5 w-5 text-gray-500" />
          </button>
          <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand">
              {profile?.full_name?.[0] || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
