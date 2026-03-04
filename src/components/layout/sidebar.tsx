'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Briefcase,
  Crown,
  Shield,
  GraduationCap,
  Lock,
  X,
  Search,
  Globe,
  Award,
  DollarSign,
  MapPin,
  BarChart3,
  TrendingUp,
  Target,
  Ghost,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
      { name: 'Analytics', href: '/analytics', icon: BarChart3, iconColor: 'text-violet-600', iconBg: 'bg-violet-100' },
    ],
  },
  {
    label: 'Create',
    items: [
      { name: 'Generate', href: '/generate', icon: Sparkles, iconColor: 'text-amber-500', iconBg: 'bg-amber-100' },
      { name: 'Country Resume', href: '/country-resume', icon: MapPin, iconColor: 'text-rose-500', iconBg: 'bg-rose-100' },
      { name: 'Applications', href: '/documents', icon: FileText, iconColor: 'text-sky-600', iconBg: 'bg-sky-100' },
    ],
  },
  {
    label: 'Jobs',
    items: [
      { name: 'Job Feed', href: '/job-feed', icon: Search, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
      { name: 'Job Tracker', href: '/job-tracker', icon: Briefcase, iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
      { name: 'Job Sites', href: '/job-sites', icon: Globe, iconColor: 'text-teal-600', iconBg: 'bg-teal-100' },
      { name: 'Market Insights', href: '/market-insights', icon: TrendingUp, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
      { name: 'GhostBoard', href: '/ghostboard', icon: Ghost, iconColor: 'text-gray-600', iconBg: 'bg-gray-100' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Credential Vault', href: '/vault', icon: Award, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
      { name: 'Skill Gap', href: '/skill-gap', icon: Target, iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
      { name: 'Cost of Living', href: '/cost-of-living', icon: DollarSign, iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, sidebarOpen, setSidebarOpen } = useAppStore()

  const userIsPro = profile?.plan === 'pro'
  const isPaid = profile?.plan === 'basic' || profile?.plan === 'pro'
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Resume Studio</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {sections.map((section) => (
            <div key={section.label || 'top'} className="mb-1">
              {section.label && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', item.iconBg)}>
                      <item.icon className={cn('h-4 w-4', item.iconColor)} />
                    </div>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Career Coach (Pro exclusive) — under Tools */}
          <Link
            href="/career-coach"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              pathname === '/career-coach'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-purple-100">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
            Career Coach
            {!userIsPro && <Lock className="h-3 w-3 text-gray-400 ml-auto" />}
          </Link>

          {/* Admin section */}
          {isAdmin && (
            <div className="mt-1">
              <div className="h-px bg-gray-200 my-2 mx-3" />
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-red-100">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                Admin
              </Link>
            </div>
          )}
        </nav>

        {/* Upgrade / Plan badge */}
        {isPaid ? (
          <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-gray-900">
                {profile?.plan === 'pro' ? 'Pro' : 'Basic'}
              </span>
            </div>
            {profile?.subscription_period_end && (
              <p className="text-xs text-gray-500 mt-1">
                Renews{' '}
                {new Date(profile.subscription_period_end).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-semibold">Upgrade Your Plan</span>
            </div>
            <p className="text-xs text-white/80 mb-3">
              More generations, all templates, and more.
            </p>
            <Link href="/upgrade">
              <Button size="sm" className="w-full bg-white text-brand hover:bg-white/90">
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
