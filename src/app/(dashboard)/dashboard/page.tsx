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
import { Sparkles, FileText, Briefcase, ArrowRight, Award, Code, FolderOpen, UserCheck } from 'lucide-react'
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

export default function DashboardPage() {
  const { profile } = useAppStore()
  const { usageCount, limit, remaining, isPaid } = useUsage(profile)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [recentJobApps, setRecentJobApps] = useState<JobApplication[]>([])
  const [vaultCounts, setVaultCounts] = useState({ certs: 0, skills: 0, samples: 0, refs: 0 })

  const savedCount = profile?.saved_applications_count ?? 0

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
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-display text-gray-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your career documents.
        </p>
      </div>

      {/* Usage + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500 font-[family-name:var(--font-body)]">
              Usage This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-gray-900">{usageCount}</span>
              <span className="text-gray-500 text-sm">/ {limit} documents</span>
            </div>
            <Progress value={(usageCount / limit) * 100} />
            <p className="text-xs text-gray-500 mt-2">{remaining} remaining</p>
            {isPaid && (
              <div className="mt-2">
                <p className="text-xs text-gray-400">
                  Saved: {savedCount} / {MAX_APPLICATIONS_PRO} applications
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/generate">
          <Card className="h-full hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Generate New Document</p>
                <p className="text-sm text-gray-500">Resume, cover letter, and more</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/documents">
          <Card className="h-full hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View Applications</p>
                <p className="text-sm text-gray-500">Browse your saved applications</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

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
              <p>No applications yet. Start by generating your first document!</p>
              <Link href="/generate">
                <Button variant="default" className="mt-4">
                  Generate Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div key={app.jdId} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.roleTitle}</p>
                      <p className="text-xs text-gray-500">
                        {app.companyName} &middot; {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {app.docCount} {app.docCount === 1 ? 'doc' : 'docs'}
                    </Badge>
                  </div>
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
              <p>No job applications tracked yet.</p>
              <Link href="/job-tracker">
                <Button variant="default" className="mt-4">
                  Track a Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.role}</p>
                    <p className="text-xs text-gray-500">{app.company}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{app.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credential Vault */}
      <Card>
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
              <p>Store your certificates, skills, work samples, and references.</p>
              <Link href="/vault">
                <Button variant="default" className="mt-4">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Award className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-lg font-bold text-gray-900">{vaultCounts.certs}</p>
                  <p className="text-xs text-gray-500">Certificates</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Code className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-lg font-bold text-gray-900">{vaultCounts.skills}</p>
                  <p className="text-xs text-gray-500">Skills</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <FolderOpen className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-lg font-bold text-gray-900">{vaultCounts.samples}</p>
                  <p className="text-xs text-gray-500">Work Samples</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <UserCheck className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-lg font-bold text-gray-900">{vaultCounts.refs}</p>
                  <p className="text-xs text-gray-500">References</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isPaid && (
        <Card className="bg-gradient-to-r from-brand to-brand-dark text-white border-0">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold mb-1 font-[family-name:var(--font-body)]">Upgrade Your Plan</h3>
              <p className="text-white/80 text-sm">
                Get more generations, all templates, and premium features.
              </p>
            </div>
            <Link href="/upgrade">
              <Button className="bg-white text-brand hover:bg-white/90">
                Upgrade Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
