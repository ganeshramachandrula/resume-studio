'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Chrome,
  Globe,
  FileText,
  Briefcase,
  Ghost,
  BarChart3,
  ArrowRight,
  Check,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'One-Click Resume Generation',
    description: 'Capture any job description and generate a tailored resume, cover letter, and more — without leaving the job board.',
  },
  {
    icon: Briefcase,
    title: 'Save to Job Tracker',
    description: 'Save jobs directly to your Resume Studio tracker. Company name, role, and URL auto-filled from the page.',
  },
  {
    icon: Ghost,
    title: 'GhostBoard Ratings',
    description: 'See company ghosting ratings inline on job listings. Rate companies after your experience.',
  },
  {
    icon: BarChart3,
    title: 'ATS Score Preview',
    description: 'After capturing a JD, jump straight to your ATS score from the popup with one click.',
  },
]

const supportedSites = [
  'Indeed',
  'LinkedIn',
  'Glassdoor',
  'Monster',
  'Dice',
  'ZipRecruiter',
]

export default function ExtensionPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Chrome className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Browser Extension</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-white mb-4">
            Apply smarter,{' '}
            <span className="text-accent">right from the job board</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Capture job descriptions, generate resumes, save jobs, and rate companies — all without leaving Indeed, LinkedIn, or Glassdoor.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
              <Chrome className="h-4 w-4" /> Chrome
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
              <Globe className="h-4 w-4" /> Edge
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
              <Globe className="h-4 w-4" /> Firefox
            </span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Supported Sites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl font-display text-white mb-6">Works on 6 job boards</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {supportedSites.map((site) => (
              <span
                key={site}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm"
              >
                <Check className="h-3.5 w-3.5 text-accent" />
                {site}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
        >
          <h2 className="text-2xl font-display text-white mb-3">Get started for free</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Sign up for Resume Studio, install the extension, and start generating resumes from any job listing.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
