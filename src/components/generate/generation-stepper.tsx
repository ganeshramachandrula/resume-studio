'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { GenerationStep } from '@/types/generation'

const steps: { key: GenerationStep; label: string }[] = [
  { key: 'jd_input', label: 'Job Description' },
  { key: 'experience_input', label: 'Your Experience' },
  { key: 'select_documents', label: 'Choose Documents' },
  { key: 'review', label: 'Review & Download' },
]

const stepOrder: GenerationStep[] = ['jd_input', 'experience_input', 'select_documents', 'review']

export function GenerationStepper({ currentStep }: { currentStep: GenerationStep }) {
  const currentIndex = stepOrder.indexOf(currentStep)

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors',
                index < currentIndex
                  ? 'bg-accent text-white'
                  : index === currentIndex
                    ? 'bg-brand text-white'
                    : 'bg-gray-200 text-gray-500'
              )}
            >
              {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:inline',
                index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-px flex-1 min-w-[20px]',
                index < currentIndex ? 'bg-accent' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
