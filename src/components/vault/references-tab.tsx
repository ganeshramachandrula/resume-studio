'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, Mail, Phone, UserCheck } from 'lucide-react'
import { ReferenceDialog } from './reference-dialog'
import { VAULT_RELATIONSHIP_LABELS } from '@/lib/constants'
import type { VaultReference } from '@/types/database'

export function ReferencesTab() {
  const [references, setReferences] = useState<VaultReference[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VaultReference | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vault_references')
      .select('*')
      .order('name', { ascending: true })
    setReferences((data as VaultReference[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('vault_references').delete().eq('id', id)
    load()
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
        <p className="text-sm text-gray-500">{references.length} reference{references.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Reference
        </Button>
      </div>

      {references.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <UserCheck className="h-10 w-10 mb-3 text-gray-300" />
            <p>No references yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {references.map((ref) => (
            <Card key={ref.id} className="group">
              <CardContent className="flex items-start justify-between p-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900">{ref.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {VAULT_RELATIONSHIP_LABELS[ref.relationship]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{ref.title} at {ref.company}</p>
                  <div className="flex items-center gap-4 mt-1">
                    {ref.email && (
                      <a href={`mailto:${ref.email}`} className="text-sm text-gray-600 hover:text-brand inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {ref.email}
                      </a>
                    )}
                    {ref.phone && (
                      <a href={`tel:${ref.phone}`} className="text-sm text-gray-600 hover:text-brand inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {ref.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(ref); setDialogOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(ref.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReferenceDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSaved={load}
        reference={editing}
      />
    </div>
  )
}
