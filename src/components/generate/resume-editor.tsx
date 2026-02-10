'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, Lock } from 'lucide-react'
import type { ResumeData, ResumeExperience, ResumeEducation } from '@/types/documents'

interface ResumeEditorProps {
  data: ResumeData
  onSave: (data: ResumeData) => void
}

export function ResumeEditor({ data, onSave }: ResumeEditorProps) {
  const [draft, setDraft] = useState<ResumeData>(() => JSON.parse(JSON.stringify(data)))

  // Helpers for immutable updates
  const updateHeader = (field: string, value: string) => {
    setDraft((d) => ({ ...d, header: { ...d.header, [field]: value } }))
  }

  const updateExperience = (index: number, field: keyof ResumeExperience, value: string | string[]) => {
    setDraft((d) => {
      const exp = [...d.experience]
      exp[index] = { ...exp[index], [field]: value }
      return { ...d, experience: exp }
    })
  }

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setDraft((d) => {
      const exp = [...d.experience]
      const bullets = [...exp[expIndex].bullets]
      bullets[bulletIndex] = value
      exp[expIndex] = { ...exp[expIndex], bullets }
      return { ...d, experience: exp }
    })
  }

  const addBullet = (expIndex: number) => {
    setDraft((d) => {
      const exp = [...d.experience]
      exp[expIndex] = { ...exp[expIndex], bullets: [...exp[expIndex].bullets, ''] }
      return { ...d, experience: exp }
    })
  }

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setDraft((d) => {
      const exp = [...d.experience]
      exp[expIndex] = {
        ...exp[expIndex],
        bullets: exp[expIndex].bullets.filter((_, i) => i !== bulletIndex),
      }
      return { ...d, experience: exp }
    })
  }

  const addExperience = () => {
    setDraft((d) => ({
      ...d,
      experience: [
        ...d.experience,
        { company: '', title: '', location: '', start_date: '', end_date: '', bullets: [''] },
      ],
    }))
  }

  const removeExperience = (index: number) => {
    setDraft((d) => ({
      ...d,
      experience: d.experience.filter((_, i) => i !== index),
    }))
  }

  const updateEducation = (index: number, field: keyof ResumeEducation, value: string | null) => {
    setDraft((d) => {
      const edu = [...d.education]
      edu[index] = { ...edu[index], [field]: value }
      return { ...d, education: edu }
    })
  }

  const addEducation = () => {
    setDraft((d) => ({
      ...d,
      education: [
        ...d.education,
        { institution: '', degree: '', field: '', graduation_date: '', gpa: null, honors: null },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setDraft((d) => ({
      ...d,
      education: d.education.filter((_, i) => i !== index),
    }))
  }

  const removeSkill = (category: 'core' | 'tools' | 'interpersonal', skill: string) => {
    setDraft((d) => ({
      ...d,
      skills: {
        ...d.skills,
        [category]: d.skills[category].filter((s) => s !== skill),
      },
    }))
  }

  const [newSkill, setNewSkill] = useState({ core: '', tools: '', interpersonal: '' })

  const addSkill = (category: 'core' | 'tools' | 'interpersonal') => {
    const value = newSkill[category].trim()
    if (!value) return
    setDraft((d) => ({
      ...d,
      skills: {
        ...d.skills,
        [category]: [...d.skills[category], value],
      },
    }))
    setNewSkill((s) => ({ ...s, [category]: '' }))
  }

  const removeCert = (cert: string) => {
    setDraft((d) => ({
      ...d,
      certifications: d.certifications.filter((c) => c !== cert),
    }))
  }

  const [newCert, setNewCert] = useState('')

  const addCert = () => {
    const value = newCert.trim()
    if (!value) return
    setDraft((d) => ({
      ...d,
      certifications: [...d.certifications, value],
    }))
    setNewCert('')
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Header</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <div className="relative">
              <Input value={draft.header.name} disabled className="pr-8 bg-gray-100" />
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title</label>
            <Input value={draft.header.title} onChange={(e) => updateHeader('title', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="relative">
              <Input value={draft.header.email} disabled className="pr-8 bg-gray-100" />
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Phone</label>
            <Input value={draft.header.phone} onChange={(e) => updateHeader('phone', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Location</label>
            <Input value={draft.header.location} onChange={(e) => updateHeader('location', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">LinkedIn</label>
            <Input value={draft.header.linkedin || ''} onChange={(e) => updateHeader('linkedin', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Website</label>
            <Input value={draft.header.website || ''} onChange={(e) => updateHeader('website', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Summary</h3>
        <Textarea
          value={draft.summary}
          onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
          className="min-h-[80px]"
        />
      </div>

      {/* Experience */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Experience</h3>
          <Button size="sm" variant="outline" onClick={addExperience}>
            <Plus className="h-3 w-3" /> Add Position
          </Button>
        </div>
        {draft.experience.map((exp, i) => (
          <div key={i} className="border rounded-xl p-3 space-y-2 relative">
            {draft.experience.length > 1 && (
              <button
                onClick={() => removeExperience(i)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Title" value={exp.title} onChange={(e) => updateExperience(i, 'title', e.target.value)} />
              <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
              <Input placeholder="Location" value={exp.location} onChange={(e) => updateExperience(i, 'location', e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Start" value={exp.start_date} onChange={(e) => updateExperience(i, 'start_date', e.target.value)} />
                <Input placeholder="End" value={exp.end_date} onChange={(e) => updateExperience(i, 'end_date', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Bullets</p>
              {exp.bullets.map((b, j) => (
                <div key={j} className="flex gap-1.5 items-start">
                  <span className="text-brand mt-2.5 text-xs">•</span>
                  <Textarea
                    value={b}
                    onChange={(e) => updateBullet(i, j, e.target.value)}
                    className="min-h-[36px] text-sm flex-1"
                    rows={1}
                  />
                  <button onClick={() => removeBullet(i, j)} className="text-gray-400 hover:text-red-500 mt-2">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => addBullet(i)}>
                <Plus className="h-3 w-3" /> Add Bullet
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Skills</h3>
        {(['core', 'tools', 'interpersonal'] as const).map((category) => (
          <div key={category}>
            <p className="text-xs text-gray-500 mb-1.5">
              {category === 'core' ? 'Core Skills' : category === 'interpersonal' ? 'Interpersonal' : 'Tools'}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {draft.skills[category].map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs gap-1 pr-1">
                  {skill}
                  <button onClick={() => removeSkill(category, skill)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                placeholder={`Add ${category} skill`}
                value={newSkill[category]}
                onChange={(e) => setNewSkill((s) => ({ ...s, [category]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(category))}
                className="h-8 text-xs"
              />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => addSkill(category)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Education</h3>
          <Button size="sm" variant="outline" onClick={addEducation}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {draft.education.map((edu, i) => (
          <div key={i} className="border rounded-xl p-3 space-y-2 relative">
            {draft.education.length > 1 && (
              <button
                onClick={() => removeEducation(i)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
              <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
              <Input placeholder="Field" value={edu.field} onChange={(e) => updateEducation(i, 'field', e.target.value)} />
              <Input placeholder="Graduation Date" value={edu.graduation_date} onChange={(e) => updateEducation(i, 'graduation_date', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Certifications</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {draft.certifications.map((cert) => (
            <Badge key={cert} variant="secondary" className="text-xs gap-1 pr-1">
              {cert}
              <button onClick={() => removeCert(cert)} className="hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input
            placeholder="Add certification"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
            className="h-8 text-xs"
          />
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addCert}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Save button */}
      <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t">
        <Button onClick={() => onSave(draft)} className="w-full">
          <Save className="h-4 w-4" /> Save & Preview
        </Button>
      </div>
    </div>
  )
}
