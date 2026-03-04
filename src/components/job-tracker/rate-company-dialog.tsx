'use client'

import { RatingForm } from '@/components/ghostboard/rating-form'
import type { JobApplication } from '@/types/database'

interface RateCompanyDialogProps {
  job: JobApplication
  onClose: () => void
}

export function RateCompanyDialog({ job, onClose }: RateCompanyDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-1">Rate {job.company}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Share your hiring experience for the {job.role} position.
        </p>
        <RatingForm
          companyName={job.company}
          role={job.role}
          jobApplicationId={job.id}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
