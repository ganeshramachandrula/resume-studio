'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUsage } from '@/lib/hooks/use-usage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, CreditCard, Loader2, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { profile, setProfile } = useAppStore()
  const { usageCount, isPro } = useUsage(profile)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)
      .select()
      .single()
    if (data) setProfile({ ...profile, ...data })
    setSaving(false)
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // ignore
    }
    setPortalLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and subscription.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-body)]">Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input value={profile?.email || ''} disabled className="bg-gray-50" />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-body)]">Subscription</CardTitle>
          <CardDescription>Manage your plan and billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              {isPro ? (
                <Crown className="h-6 w-6 text-accent" />
              ) : (
                <CreditCard className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {profile?.plan === 'pro_annual'
                    ? 'Pro Annual'
                    : profile?.plan === 'pro_monthly'
                      ? 'Pro Monthly'
                      : 'Free Plan'}
                </p>
                <p className="text-xs text-gray-500">
                  {isPro ? 'Unlimited documents' : `${usageCount}/2 documents used this month`}
                </p>
              </div>
            </div>
            <Badge variant={isPro ? 'accent' : 'secondary'}>
              {isPro ? 'Active' : 'Free'}
            </Badge>
          </div>

          {isPro ? (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Manage Subscription
            </Button>
          ) : (
            <Button onClick={() => router.push('/pricing')}>
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="p-6">
          <Button variant="outline" onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
