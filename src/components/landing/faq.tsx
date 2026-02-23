'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What does Resume Studio actually do?',
    answer:
      'You paste a job description, add your experience, and Resume Studio generates a complete application package — ATS-optimized resume, cover letter, LinkedIn summary, cold outreach email, interview prep guide, and certification recommendations — all tailored to that specific role.',
  },
  {
    question: 'What is an ATS score and why does it matter?',
    answer:
      'ATS (Applicant Tracking System) is software that most companies use to filter resumes before a human ever sees them. Our ATS score analyzes your resume against the job description and tells you how well it matches. If keywords are missing, our "Fix It" tool adds them automatically.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. Your documents and personal information are stored securely with row-level security, encrypted in transit, and never shared with third parties. We do not use your data to train AI models. You can delete your account and all data at any time.',
  },
  {
    question: 'Can I use Resume Studio in my language?',
    answer:
      'Pro plan users can generate documents in 11 languages including Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Hindi, Arabic, and Italian — plus any custom language you specify.',
  },
  {
    question: 'What happens after my 2 free documents?',
    answer:
      'You can wait until next month for 2 more free documents, purchase a credit pack (3 generations for $2.99, never expire), or upgrade to Basic ($5.99/month for 10 generations) or Pro ($10.99/month for 20 generations plus premium features).',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. There are no contracts or cancellation fees. You can cancel from your settings page and you will keep access until the end of your billing period.',
  },
]

export const faqStructuredData = faqs.map((faq) => ({
  '@type': 'Question' as const,
  name: faq.question,
  acceptedAnswer: {
    '@type': 'Answer' as const,
    text: faq.answer,
  },
}))

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white font-medium text-sm">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
