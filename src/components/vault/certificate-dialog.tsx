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
import type { VaultCertificate } from '@/types/database'

export function CertificateDialog({
  open,
  onClose,
  onSaved,
  certificate,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  certificate?: VaultCertificate | null
}) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [credentialUrl, setCredentialUrl] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (certificate) {
      setName(certificate.name)
      setIssuer(certificate.issuer)
      setIssueDate(certificate.issue_date)
      setExpiryDate(certificate.expiry_date || '')
      setCredentialUrl(certificate.credential_url || '')
      setDescription(certificate.description || '')
    } else {
      setName('')
      setIssuer('')
      setIssueDate('')
      setExpiryDate('')
      setCredentialUrl('')
      setDescription('')
    }
  }, [certificate, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name,
      issuer,
      issue_date: issueDate,
      expiry_date: expiryDate || null,
      credential_url: credentialUrl || null,
      description: description || null,
      updated_at: new Date().toISOString(),
    }

    if (certificate) {
      await supabase.from('vault_certificates').update(payload).eq('id', certificate.id)
    } else {
      await supabase.from('vault_certificates').insert(payload)
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{certificate ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Certificate Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., AWS Solutions Architect" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Issuer</label>
            <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="e.g., Amazon Web Services" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issue Date</label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Expiry Date</label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Credential URL</label>
            <Input value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://..." type="url" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." className="min-h-[80px]" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !name || !issuer || !issueDate}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {certificate ? 'Save Changes' : 'Add Certificate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
