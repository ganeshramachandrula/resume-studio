'use client'

import { motion } from 'framer-motion'
import {
  Target,
  BarChart3,
  Package,
  Palette,
  Briefcase,
  MessageSquare,
} from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'JD Matching',
    description: 'Parses job descriptions and tailors every bullet point to match exact keywords and requirements.',
  },
  {
    icon: BarChart3,
    title: 'ATS Score',
    description: 'Real-time scoring against Applicant Tracking Systems with actionable improvement suggestions.',
  },
  {
    icon: Package,
    title: 'One-Click Package',
    description: 'Generate resume, cover letter, LinkedIn, cold email, and interview prep — all at once.',
  },
  {
    icon: Palette,
    title: 'Pro Templates',
    description: 'Beautiful, ATS-friendly PDF templates — Modern, Classic, and Minimal designs.',
  },
  {
    icon: Briefcase,
    title: 'Job Tracker',
    description: 'Kanban-style board to track applications from saved to offer with linked documents.',
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    description: 'Role-specific questions with model answers, tips, and salary negotiation guidance.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            Everything you need to land more interviews
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From parsing job descriptions to acing the interview — one platform does it all.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-body)]">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
