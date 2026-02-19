'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Briefcase,
  Settings,
  Crown,
  Shield,
  GraduationCap,
  Lock,
  X,
  Users,
  ExternalLink,
  Search,
  LogOut,
  LifeBuoy,
} from 'lucide-react'
import { AFFILIATE_PARTNERS, buildAffiliateUrl } from '@/lib/affiliate-partners'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Generate', href: '/generate', icon: Sparkles },
  { name: 'Applications', href: '/documents', icon: FileText },
  { name: 'Job Feed', href: '/job-feed', icon: Search },
  { name: 'Job Tracker', href: '/job-tracker', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Support', href: '/support', icon: LifeBuoy },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, sidebarOpen, setSidebarOpen } = useAppStore()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual' || profile?.plan === 'team'
  const userIsAnnual = profile?.plan === 'pro_annual' || profile?.plan === 'team'
  const isTeam = profile?.plan === 'team'
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
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
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

        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}

          {/* Career Coach (Annual/Team exclusive) */}
          <Link
            href="/career-coach"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === '/career-coach'
                ? 'bg-brand/10 text-brand'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <GraduationCap className="h-5 w-5" />
            Career Coach
            {!userIsAnnual && <Lock className="h-3 w-3 text-gray-400 ml-auto" />}
          </Link>

          {/* Team management (Team plan only) */}
          {isTeam && (
            <Link
              href="/team"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === '/team'
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Users className="h-5 w-5" />
              Team
            </Link>
          )}

          {isAdmin && (
            <>
              <div className="h-px bg-gray-200 my-2" />
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Shield className="h-5 w-5" />
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Resources (Affiliate Partners) */}
        <div className="px-3 py-2">
          <div className="h-px bg-gray-200 mb-2" />
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resources</p>
          {AFFILIATE_PARTNERS.slice(0, 3).map((partner) => (
            <a
              key={partner.id}
              href={buildAffiliateUrl(partner)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch('/api/affiliate/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ partnerId: partner.id }),
                })
              }}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {partner.name}
            </a>
          ))}
        </div>

        {isPro ? (
          <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-gray-900">
                {profile?.plan === 'team'
                  ? 'Team Plan'
                  : profile?.plan === 'pro_annual'
                    ? 'Pro Annual'
                    : 'Pro Monthly'}
              </span>
            </div>
            {profile?.subscription_period_end && (
              <p className="text-xs text-gray-500 mt-1">
                Renews {new Date(profile.subscription_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-white/80 mb-3">
              Unlimited documents, all templates, and more.
            </p>
            <Link href="/upgrade">
              <Button size="sm" className="w-full bg-white text-brand hover:bg-white/90">
                Upgrade
              </Button>
            </Link>
          </div>
        )}

        <div className="px-3 pb-4">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  )
}
