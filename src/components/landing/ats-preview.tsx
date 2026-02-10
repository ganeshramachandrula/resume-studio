'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

function AnimatedScore({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let current = 0
    const interval = setInterval(() => {
      current += 1
      if (current >= target) {
        setScore(target)
        clearInterval(interval)
      } else {
        setScore(current)
      }
    }, 15)
    return () => clearInterval(interval)
  }, [isInView, target])

  const circumference = 2 * Math.PI * 58
  const offset = circumference - (score / 100) * circumference

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r="58"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r="58"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-100"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-lg text-gray-400">/100</span>
      </div>
    </div>
  )
}

export function ATSPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gray-900 border border-white/10 p-8 md:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display text-white mb-4">
                Know your ATS score before you apply
              </h2>
              <p className="text-gray-400 mb-8">
                We analyze your resume against the job description and give you a
                detailed breakdown — keywords matched, skills covered, and exactly what
                to improve.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Keyword Match: 92%</p>
                    <p className="text-gray-500 text-xs">18/20 key terms found in your resume</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Skills Coverage: 88%</p>
                    <p className="text-gray-500 text-xs">14/16 required skills covered</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Impact Score: 75%</p>
                    <p className="text-gray-500 text-xs">3 bullets lack quantified results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Missing: CRM, Market Analysis</p>
                    <p className="text-gray-500 text-xs">Add these keywords to improve your score</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <AnimatedScore target={87} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
