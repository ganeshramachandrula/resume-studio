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
import { Loader2 } from 'lucide-react'
import { VAULT_RELATIONSHIPS, VAULT_RELATIONSHIP_LABELS } from '@/lib/constants'
import type { VaultReference } from '@/types/database'

export function ReferenceDialog({
  open,
  onClose,
  onSaved,
  reference,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  reference?: VaultReference | null
}) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState<string>('colleague')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (reference) {
      setName(reference.name)
      setTitle(reference.title)
      setCompany(reference.company)
      setEmail(reference.email || '')
      setPhone(reference.phone || '')
      setRelationship(reference.relationship)
    } else {
      setName('')
      setTitle('')
      setCompany('')
      setEmail('')
      setPhone('')
      setRelationship('colleague')
    }
  }, [reference, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name,
      title,
      company,
      email: email || null,
      phone: phone || null,
      relationship,
      updated_at: new Date().toISOString(),
    }

    if (reference) {
      await supabase.from('vault_references').update(payload).eq('id', reference.id)
    } else {
      await supabase.from('vault_references').insert(payload)
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reference ? 'Edit Reference' : 'Add Reference'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Smith" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., VP Engineering" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Acme Corp" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Relationship</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              required
            >
              {VAULT_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{VAULT_RELATIONSHIP_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0123" type="tel" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !name || !title || !company}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {reference ? 'Save Changes' : 'Add Reference'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
