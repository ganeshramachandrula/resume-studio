'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { VAULT_WORK_SAMPLE_TYPES, VAULT_WORK_SAMPLE_TYPE_LABELS } from '@/lib/constants'
import type { VaultWorkSample } from '@/types/database'

export function WorkSampleDialog({
  open,
  onClose,
  onSaved,
  workSample,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  workSample?: VaultWorkSample | null
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<string>('project')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (workSample) {
      setTitle(workSample.title)
      setDescription(workSample.description || '')
      setUrl(workSample.url)
      setType(workSample.type)
    } else {
      setTitle('')
      setDescription('')
      setUrl('')
      setType('project')
    }
  }, [workSample, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      title,
      description: description || null,
      url,
      type,
      updated_at: new Date().toISOString(),
    }

    if (workSample) {
      await supabase.from('vault_work_samples').update(payload).eq('id', workSample.id)
    } else {
      await supabase.from('vault_work_samples').insert(payload)
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{workSample ? 'Edit Work Sample' : 'Add Work Sample'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., E-commerce Platform" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              required
            >
              {VAULT_WORK_SAMPLE_TYPES.map((t) => (
                <option key={t} value={t}>{VAULT_WORK_SAMPLE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the work..." className="min-h-[80px]" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !title || !url}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {workSample ? 'Save Changes' : 'Add Work Sample'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
