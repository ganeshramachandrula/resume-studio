'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Lock } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'
import { useAppStore } from '@/store/app-store'

export function ExperienceInput() {
  const { experience, setExperience, contactInfo, setContactInfo, setStep } = useGenerationStore()
  const { profile } = useAppStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Auto-populate name + email from auth profile on mount
  useEffect(() => {
    if (profile && !contactInfo.name && !contactInfo.email) {
      const fullName = profile.full_name || ''
      const parts = fullName.trim().split(/\s+/)
      const first = parts[0] || ''
      const last = parts.slice(1).join(' ') || ''
      setFirstName(first)
      setLastName(last)
      setContactInfo({
        name: fullName,
        email: profile.email || '',
      })
    }
  }, [profile, contactInfo.name, contactInfo.email, setContactInfo])

  // Sync first + last name into contactInfo.name
  useEffect(() => {
    const combined = `${firstName} ${lastName}`.trim()
    if (combined && combined !== contactInfo.name) {
      setContactInfo({ name: combined })
    }
  }, [firstName, lastName]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-gray-900 mb-2">
          Your Details & Experience
        </h2>
        <p className="text-gray-500">
          Confirm your contact info, then paste your resume or describe your work history.
        </p>
      </div>

      {/* Contact Info Fields */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Contact Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">First Name</label>
            <Input
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
            <Input
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="relative">
              <Input
                value={contactInfo.email}
                disabled
                className="pr-8 bg-gray-100"
              />
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Phone</label>
            <Input
              placeholder="(555) 123-4567"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Location</label>
            <Input
              placeholder="San Francisco, CA"
              value={contactInfo.location}
              onChange={(e) => setContactInfo({ location: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">LinkedIn URL</label>
            <Input
              placeholder="linkedin.com/in/yourname"
              value={contactInfo.linkedin}
              onChange={(e) => setContactInfo({ linkedin: e.target.value })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Name is pre-filled from your account. Edit as needed — it will appear exactly as shown on your resume.
        </p>
      </div>

      <Textarea
        placeholder={`Paste your resume or describe your experience here. Include:\n\n- Work history (company, title, dates, responsibilities)\n- Education (degree, school, graduation year)\n- Skills (professional skills, tools, certifications)\n- Certifications\n- Notable achievements`}
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        className="min-h-[350px]"
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep('jd_input')}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => setStep('select_documents')}
          disabled={experience.length < 50}
        >
          Continue to Document Selection
        </Button>
      </div>
    </div>
  )
}
