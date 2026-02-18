'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Target, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ONBOARDING_KEY = 'rs-onboarding-seen'

const steps = [
  {
    icon: FileText,
    title: 'Paste any job description',
    description:
      'Copy a job posting from any site. Resume Studio extracts the role, company, required skills, and ATS keywords automatically.',
  },
  {
    icon: Target,
    title: 'Get 6 tailored documents',
    description:
      'A full application package — resume, cover letter, LinkedIn summary, cold email, interview prep, and certification guide — all matched to that specific job.',
  },
  {
    icon: Sparkles,
    title: 'Check your ATS score',
    description:
      'See how well your resume matches the job. Missing keywords? Hit "Fix It" and they are added automatically. Download and apply with confidence.',
  },
]

export function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY)
    if (!seen) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      dismiss()
      router.push('/generate')
    }
  }

  if (!visible) return null

  const current = steps[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand/10 mb-5">
            <Icon className="h-7 w-7 text-brand" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2 font-[family-name:var(--font-body)]">
            {current.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-brand' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-gray-500"
              onClick={dismiss}
            >
              Skip
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleNext}
            >
              {step < steps.length - 1 ? 'Next' : 'Generate My First Document'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
