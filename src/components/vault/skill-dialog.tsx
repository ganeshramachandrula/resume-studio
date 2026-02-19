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
import { VAULT_PROFICIENCY_LEVELS, VAULT_PROFICIENCY_LABELS, VAULT_SKILL_CATEGORIES } from '@/lib/constants'
import type { VaultSkill } from '@/types/database'

export function SkillDialog({
  open,
  onClose,
  onSaved,
  skill,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  skill?: VaultSkill | null
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [proficiency, setProficiency] = useState<string>('intermediate')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (skill) {
      setName(skill.name)
      setCategory(skill.category || '')
      setProficiency(skill.proficiency)
    } else {
      setName('')
      setCategory('')
      setProficiency('intermediate')
    }
  }, [skill, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name,
      category: category || null,
      proficiency,
      updated_at: new Date().toISOString(),
    }

    if (skill) {
      await supabase.from('vault_skills').update(payload).eq('id', skill.id)
    } else {
      await supabase.from('vault_skills').insert(payload)
    }

    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Skill Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., TypeScript" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <option value="">Select category...</option>
              {VAULT_SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Proficiency</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              required
            >
              {VAULT_PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>{VAULT_PROFICIENCY_LABELS[level]}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {skill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
