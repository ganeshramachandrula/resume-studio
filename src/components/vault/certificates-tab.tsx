'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, ExternalLink, Award } from 'lucide-react'
import { CertificateDialog } from './certificate-dialog'
import type { VaultCertificate } from '@/types/database'

export function CertificatesTab() {
  const [certificates, setCertificates] = useState<VaultCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VaultCertificate | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vault_certificates')
      .select('*')
      .order('issue_date', { ascending: false })
    setCertificates((data as VaultCertificate[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('vault_certificates').delete().eq('id', id)
    load()
  }

  const isExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Award className="h-10 w-10 mb-3 text-gray-300" />
            <p>No certificates yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="group">
              <CardContent className="flex items-start justify-between p-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    {cert.expiry_date && (
                      <Badge variant={isExpired(cert.expiry_date) ? 'destructive' : 'secondary'} className="text-xs">
                        {isExpired(cert.expiry_date) ? 'Expired' : `Expires ${new Date(cert.expiry_date).toLocaleDateString()}`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{cert.issuer} &middot; Issued {new Date(cert.issue_date).toLocaleDateString()}</p>
                  {cert.description && <p className="text-sm text-gray-600 mt-1">{cert.description}</p>}
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline inline-flex items-center gap-1 mt-1">
                      View Credential <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(cert); setDialogOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(cert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CertificateDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSaved={load}
        certificate={editing}
      />
    </div>
  )
}
