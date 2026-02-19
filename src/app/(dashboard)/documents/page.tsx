'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { ApplicationBundleCard } from '@/components/documents/application-bundle-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MAX_APPLICATIONS_PRO } from '@/lib/constants'
import type { Document } from '@/types/database'

interface JDInfo {
  id: string
  company_name: string | null
  role_title: string | null
  created_at: string
}

interface DocumentWithJD extends Document {
  job_descriptions: JDInfo
}

interface ApplicationBundle {
  jobDescriptionId: string
  companyName: string
  roleTitle: string
  createdAt: string
  documents: Document[]
}

function groupByJD(documents: DocumentWithJD[]): ApplicationBundle[] {
  const map = new Map<string, ApplicationBundle>()

  for (const doc of documents) {
    const jdId = doc.job_description_id || 'unknown'
    if (!map.has(jdId)) {
      map.set(jdId, {
        jobDescriptionId: jdId,
        companyName: doc.job_descriptions?.company_name || 'Unknown Company',
        roleTitle: doc.job_descriptions?.role_title || 'Untitled Role',
        createdAt: doc.job_descriptions?.created_at || doc.created_at,
        documents: [],
      })
    }
    map.get(jdId)!.documents.push(doc)
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export default function DocumentsPage() {
  const { profile, setProfile } = useAppStore()
  const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual'
  const [bundles, setBundles] = useState<ApplicationBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadDocuments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('*, job_descriptions!inner(id, company_name, role_title, created_at)')
      .order('created_at', { ascending: false })

    if (data) {
      setBundles(groupByJD(data as DocumentWithJD[]))
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
  useEffect(() => { void loadDocuments() }, [])

  async function handleDeleteApplication(jobDescriptionId: string) {
    setDeletingId(jobDescriptionId)
    try {
      const res = await fetch('/api/documents/delete-application', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescriptionId }),
      })
      const data = await res.json()
      if (data.success) {
        setBundles((prev) => prev.filter((b) => b.jobDescriptionId !== jobDescriptionId))
        // Update profile's saved_applications_count
        if (profile) {
          setProfile({
            ...profile,
            saved_applications_count: Math.max(0, (profile.saved_applications_count || 0) - 1),
          })
        }
      }
    } catch {
      // Silently fail, user can retry
    }
    setDeletingId(null)
  }

  const savedCount = profile?.saved_applications_count ?? bundles.length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">
            {isPro
              ? 'Your saved applications, grouped by job description.'
              : 'Upgrade to Pro to save and organize your applications.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPro && (
            <Badge
              variant={savedCount >= MAX_APPLICATIONS_PRO ? 'destructive' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {savedCount}/{MAX_APPLICATIONS_PRO} applications
            </Badge>
          )}
          <Link href="/generate">
            <Button>Generate New</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !isPro ? (
        /* Free user empty state */
        <div className="text-center py-16">
          <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Save your applications with Pro</h3>
          <p className="text-gray-500 mb-1 max-w-md mx-auto">
            Generate and preview documents for free. Upgrade to Pro to save, organize, and access your documents anytime.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link href="/upgrade">
              <Button>
                <Crown className="h-4 w-4" /> Upgrade to Pro
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="outline">
                Generate &amp; Preview <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : bundles.length === 0 ? (
        /* Pro user empty state */
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
          <p className="text-gray-500 mb-4">
            Generate your first document to get started. Documents are automatically grouped by job description.
          </p>
          <Link href="/generate">
            <Button>Generate Document</Button>
          </Link>
        </div>
      ) : (
        /* Application bundles */
        <div className="space-y-3">
          {bundles.map((bundle) => (
            <ApplicationBundleCard
              key={bundle.jobDescriptionId}
              bundle={bundle}
              onDelete={handleDeleteApplication}
              isDeleting={deletingId === bundle.jobDescriptionId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
