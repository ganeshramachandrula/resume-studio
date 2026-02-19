'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, ExternalLink, FolderOpen } from 'lucide-react'
import { WorkSampleDialog } from './work-sample-dialog'
import { VAULT_WORK_SAMPLE_TYPE_LABELS } from '@/lib/constants'
import type { VaultWorkSample } from '@/types/database'

export function WorkSamplesTab() {
  const [samples, setSamples] = useState<VaultWorkSample[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VaultWorkSample | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vault_work_samples')
      .select('*')
      .order('created_at', { ascending: false })
    setSamples((data as VaultWorkSample[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('vault_work_samples').delete().eq('id', id)
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
        <p className="text-sm text-gray-500">{samples.length} work sample{samples.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Work Sample
        </Button>
      </div>

      {samples.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FolderOpen className="h-10 w-10 mb-3 text-gray-300" />
            <p>No work samples yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {samples.map((sample) => (
            <Card key={sample.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{sample.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {VAULT_WORK_SAMPLE_TYPE_LABELS[sample.type]}
                      </Badge>
                    </div>
                    {sample.description && <p className="text-sm text-gray-600 line-clamp-2">{sample.description}</p>}
                    <a href={sample.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline inline-flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(sample); setDialogOpen(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(sample.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WorkSampleDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSaved={load}
        workSample={editing}
      />
    </div>
  )
}
