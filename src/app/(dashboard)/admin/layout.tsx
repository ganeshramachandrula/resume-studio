'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, MessageSquare, GraduationCap, Ghost } from 'lucide-react'

const adminNav = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Coach Usage', href: '/admin/coach-usage', icon: GraduationCap },
  { name: 'GhostBoard', href: '/admin/ghostboard', icon: Ghost },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Wait until profile loads
    if (profile === null) return
    if (profile.role !== 'admin') {
      router.replace('/dashboard')
      return
    }
    setChecked(true) // eslint-disable-line react-hooks/set-state-in-effect -- auth guard
  }, [profile, router])

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage users and support messages.</p>
      </div>

      <nav className="flex gap-1 border-b border-gray-200 pb-px">
        {adminNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
