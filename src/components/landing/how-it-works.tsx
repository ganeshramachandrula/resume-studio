'use client'

import { motion } from 'framer-motion'
import { ClipboardPaste, UserPen, Sparkles, Download } from 'lucide-react'

const steps = [
  {
    icon: ClipboardPaste,
    step: '01',
    title: 'Paste Job Description',
    description: 'Copy and paste the job posting. We instantly extract key skills, requirements, and keywords.',
  },
  {
    icon: UserPen,
    step: '02',
    title: 'Add Your Experience',
    description: 'Paste your resume or fill in your work history. Save it once, reuse forever.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Everything Gets Generated',
    description: 'In seconds, get a tailored resume, cover letter, LinkedIn summary, cold email, and interview prep.',
  },
  {
    icon: Download,
    step: '04',
    title: 'Download & Apply',
    description: 'Download beautiful PDFs, copy to clipboard, or save to your document library.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            How it works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From job posting to full application package in under 60 seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand/10 mb-4">
                <step.icon className="h-7 w-7 text-brand-light" />
              </div>
              <div className="text-accent font-bold text-sm mb-2">{step.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-body)]">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-16px)] w-8 border-t border-dashed border-white/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
