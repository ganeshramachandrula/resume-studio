'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUsage } from '@/lib/hooks/use-usage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, FileText, Briefcase, ArrowRight, Award, Code,
  FolderOpen, UserCheck, Zap, Search, MapPin, Globe, TrendingUp
} from 'lucide-react'
import { MAX_APPLICATIONS_PRO } from '@/lib/constants'
import { OnboardingModal } from '@/components/onboarding-modal'
import type { Document, JobApplication } from '@/types/database'

interface JDInfo {
  id: string
  company_name: string | null
  role_title: string | null
  created_at: string
}

interface DocumentWithJD extends Document {
  job_descriptions: JDInfo
}

interface RecentApplication {
  jdId: string
  companyName: string
  roleTitle: string
  createdAt: string
  docCount: number
  docTypes: string[]
}

function groupRecentApplications(docs: DocumentWithJD[]): RecentApplication[] {
  const map = new Map<string, RecentApplication>()
  for (const doc of docs) {
    const jdId = doc.job_description_id || 'unknown'
    if (!map.has(jdId)) {
      map.set(jdId, {
        jdId,
        companyName: doc.job_descriptions?.company_name || 'Unknown Company',
        roleTitle: doc.job_descriptions?.role_title || 'Untitled Role',
        createdAt: doc.job_descriptions?.created_at || doc.created_at,
        docCount: 0,
        docTypes: [],
      })
    }
    const app = map.get(jdId)!
    app.docCount++
    if (!app.docTypes.includes(doc.type)) {
      app.docTypes.push(doc.type)
    }
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
}

export default function DashboardPage() {
  const { profile } = useAppStore()
  const { usageCount, limit, remaining, isPaid } = useUsage(profile)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [recentJobApps, setRecentJobApps] = useState<JobApplication[]>([])
  const [vaultCounts, setVaultCounts] = useState({ certs: 0, skills: 0, samples: 0, refs: 0 })

  const savedCount = profile?.saved_applications_count ?? 0
  const plan = profile?.plan || 'free'

  useEffect(() => {
    const supabase = createClient()
    async function loadData() {
      const [docsRes, appsRes, certsRes, skillsRes, samplesRes, refsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*, job_descriptions!inner(id, company_name, role_title, created_at)')
          .order('created_at', { ascending: false })
          .limit(25),
        supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('vault_certificates').select('id', { count: 'exact', head: true }),
        supabase.from('vault_skills').select('id', { count: 'exact', head: true }),
        supabase.from('vault_work_samples').select('id', { count: 'exact', head: true }),
        supabase.from('vault_references').select('id', { count: 'exact', head: true }),
      ])
      if (docsRes.data) {
        setRecentApps(groupRecentApplications(docsRes.data as DocumentWithJD[]))
      }
      if (appsRes.data) setRecentJobApps(appsRes.data as JobApplication[])
      setVaultCounts({
        certs: certsRes.count ?? 0,
        skills: skillsRes.count ?? 0,
        samples: samplesRes.count ?? 0,
        refs: refsRes.count ?? 0,
      })
    }
    loadData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <OnboardingModal />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark via-[#0f1a3a] to-[#0a2540] p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-accent/15 rounded-full blur-[100px] translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white/90 border-white/20 text-xs">
              {PLAN_LABELS[plan] || 'Free'} Plan
            </Badge>
            {isPaid && (
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                <Zap className="h-3 w-3 mr-0.5" /> Active
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-white mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="text-white/60 max-w-xl">
            Your AI-powered career toolkit. Generate documents, track applications, and land your dream job.
          </p>

          {/* Inline usage stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Generations</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold">{usageCount}</span>
                <span className="text-white/50 text-sm">/ {limit}</span>
              </div>
              <div className="w-32 mt-1.5">
                <Progress value={(usageCount / limit) * 100} className="h-1.5 bg-white/10" />
              </div>
            </div>
            {isPaid && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Saved Apps</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold">{savedCount}</span>
                  <span className="text-white/50 text-sm">/ {MAX_APPLICATIONS_PRO}</span>
                </div>
                <div className="w-32 mt-1.5">
                  <Progress value={(savedCount / MAX_APPLICATIONS_PRO) * 100} className="h-1.5 bg-white/10" />
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Remaining</p>
              <span className="text-2xl font-bold text-accent">{remaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/generate">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand/40 hover:shadow-lg transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/10 transition-colors" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Generate</p>
            <p className="text-xs text-gray-500 mt-0.5">AI documents</p>
          </div>
        </Link>

        <Link href="/job-feed">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-accent/40 hover:shadow-lg transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Job Feed</p>
            <p className="text-xs text-gray-500 mt-0.5">Search openings</p>
          </div>
        </Link>

        <Link href="/country-resume">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-purple-400/40 hover:shadow-lg transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Country Resume</p>
            <p className="text-xs text-gray-500 mt-0.5">Localized formats</p>
          </div>
        </Link>

        <Link href="/documents">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-orange-400/40 hover:shadow-lg transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">Documents</p>
            <p className="text-xs text-gray-500 mt-0.5">View saved docs</p>
          </div>
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-body)]">Recent Applications</CardTitle>
            <Link href="/documents">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No applications yet.</p>
                <Link href="/generate">
                  <Button variant="default" size="sm" className="mt-3">
                    Generate Document
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApps.map((app) => (
                  <div key={app.jdId} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{app.roleTitle}</p>
                        <p className="text-xs text-gray-500">
                          {app.companyName} &middot; {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {app.docCount} {app.docCount === 1 ? 'doc' : 'docs'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Tracker */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-body)]">Job Tracker</CardTitle>
            <Link href="/job-tracker">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentJobApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No jobs tracked yet.</p>
                <Link href="/job-tracker">
                  <Button variant="default" size="sm" className="mt-3">
                    Track a Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentJobApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{app.role}</p>
                        <p className="text-xs text-gray-500">{app.company}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs flex-shrink-0">{app.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credential Vault + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-body)]">Credential Vault</CardTitle>
            <Link href="/vault">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {vaultCounts.certs + vaultCounts.skills + vaultCounts.samples + vaultCounts.refs === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Store certificates, skills, work samples, and references.</p>
                <Link href="/vault">
                  <Button variant="default" size="sm" className="mt-3">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Award, label: 'Certificates', count: vaultCounts.certs, color: 'text-brand', bg: 'bg-brand/10' },
                  { icon: Code, label: 'Skills', count: vaultCounts.skills, color: 'text-accent', bg: 'bg-accent/10' },
                  { icon: FolderOpen, label: 'Samples', count: vaultCounts.samples, color: 'text-purple-600', bg: 'bg-purple-100' },
                  { icon: UserCheck, label: 'References', count: vaultCounts.refs, color: 'text-orange-600', bg: 'bg-orange-100' },
                ].map(({ icon: Icon, label, count, color, bg }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-body)] text-sm font-medium text-gray-500">
              Explore More
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/career-coach', icon: TrendingUp, label: 'Career Coach', desc: 'AI guidance', color: 'text-brand', bg: 'bg-brand/10', pro: true },
              { href: '/cost-of-living', icon: Globe, label: 'Cost of Living', desc: 'Compare cities', color: 'text-accent', bg: 'bg-accent/10', pro: false },
              { href: '/job-sites', icon: Globe, label: 'Job Sites', desc: '40+ boards', color: 'text-purple-600', bg: 'bg-purple-100', pro: false },
            ].map(({ href, icon: Icon, label, desc, color, bg, pro }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {pro && plan !== 'pro' && (
                    <Badge className="bg-brand/10 text-brand border-brand/20 text-xs flex-shrink-0">Pro</Badge>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {!isPaid && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-dark to-[#0a2540] p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display mb-2">Unlock Your Full Potential</h3>
              <p className="text-white/70 text-sm max-w-md">
                Get more generations, all 13 templates, premium fonts, multi-language support, and AI career coaching.
              </p>
            </div>
            <Link href="/upgrade">
              <Button className="bg-white text-brand hover:bg-white/90 shadow-lg">
                Upgrade Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
