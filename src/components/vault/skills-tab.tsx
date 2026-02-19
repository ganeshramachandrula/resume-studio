'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, Code } from 'lucide-react'
import { SkillDialog } from './skill-dialog'
import { VAULT_PROFICIENCY_LABELS } from '@/lib/constants'
import type { VaultSkill } from '@/types/database'

const PROFICIENCY_COLORS: Record<string, string> = {
  beginner: 'bg-gray-100 text-gray-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-brand/10 text-brand',
  expert: 'bg-accent/10 text-accent',
}

export function SkillsTab() {
  const [skills, setSkills] = useState<VaultSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<VaultSkill | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vault_skills')
      .select('*')
      .order('name', { ascending: true })
    setSkills((data as VaultSkill[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('vault_skills').delete().eq('id', id)
    load()
  }

  // Group by category
  const grouped = skills.reduce<Record<string, VaultSkill[]>>((acc, s) => {
    const cat = s.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})
  const categories = Object.keys(grouped).sort()

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4" /> Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Code className="h-10 w-10 mb-3 text-gray-300" />
            <p>No skills yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{cat}</h3>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((skill) => (
                  <div key={skill.id} className="group relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:border-brand/30 transition-colors">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <Badge className={`text-xs ${PROFICIENCY_COLORS[skill.proficiency] || ''}`}>
                      {VAULT_PROFICIENCY_LABELS[skill.proficiency]}
                    </Badge>
                    <div className="hidden group-hover:inline-flex items-center gap-0.5 ml-1">
                      <button onClick={() => { setEditing(skill); setDialogOpen(true) }} className="p-0.5 rounded hover:bg-gray-100">
                        <Pencil className="h-3 w-3 text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(skill.id)} className="p-0.5 rounded hover:bg-gray-100">
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SkillDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSaved={load}
        skill={editing}
      />
    </div>
  )
}
