'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { useGenerationStore } from '@/store/generation-store'

export function ExperienceInput() {
  const { experience, setExperience, setStep } = useGenerationStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display text-gray-900 mb-2">
          Add Your Experience
        </h2>
        <p className="text-gray-500">
          Paste your resume text or describe your work history, education, and skills.
          The more detail you provide, the better the output.
        </p>
      </div>

      <Textarea
        placeholder={`Paste your resume or describe your experience here. Include:\n\n- Work history (company, title, dates, responsibilities)\n- Education (degree, school, graduation year)\n- Skills (technical skills, tools, languages)\n- Certifications\n- Notable achievements`}
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
