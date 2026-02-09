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
import { Sparkles, FileText, Briefcase, Crown, ArrowRight } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { Document, JobApplication } from '@/types/database'

export default function DashboardPage() {
  const { profile } = useAppStore()
  const { usageCount, remaining, isPro } = useUsage(profile)
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [recentApps, setRecentApps] = useState<JobApplication[]>([])

  useEffect(() => {
    const supabase = createClient()
    async function loadData() {
      const [docsRes, appsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      if (docsRes.data) setRecentDocs(docsRes.data as Document[])
      if (appsRes.data) setRecentApps(appsRes.data as JobApplication[])
    }
    loadData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
            {isPro ? (
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold text-gray-900">Unlimited</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{usageCount}</span>
                  <span className="text-gray-500 text-sm">/ 2 documents</span>
                </div>
                <Progress value={(usageCount / 2) * 100} />
                <p className="text-xs text-gray-500 mt-2">{remaining} remaining</p>
              </>
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
                <p className="font-semibold text-gray-900">View Documents</p>
                <p className="text-sm text-gray-500">Browse your generated docs</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-[family-name:var(--font-body)]">Recent Documents</CardTitle>
          <Link href="/documents">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No documents yet. Start by generating your first one!</p>
              <Link href="/generate">
                <Button variant="default" className="mt-4">
                  Generate Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{DOCUMENT_TYPE_LABELS[doc.type]}</Badge>
                    {doc.ats_score && (
                      <Badge variant="accent">{doc.ats_score}% ATS</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-[family-name:var(--font-body)]">Recent Applications</CardTitle>
          <Link href="/job-tracker">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentApps.length === 0 ? (
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
              {recentApps.map((app) => (
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

      {/* Upgrade CTA */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-brand to-brand-dark text-white border-0">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold mb-1 font-[family-name:var(--font-body)]">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm">
                Unlimited documents, all templates, job tracker, and more.
              </p>
            </div>
            <Link href="/pricing">
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
