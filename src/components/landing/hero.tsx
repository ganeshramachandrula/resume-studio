'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm text-gray-300">Smart Career Documents</span>
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-display text-white max-w-4xl mx-auto leading-tight mb-6"
        >
          Land your dream job{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
            with one click
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Paste a job description, add your experience, and get a full application
          package — ATS-optimized resume, cover letter, LinkedIn summary, cold email,
          and interview prep — in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button
              size="xl"
              variant="accent"
              className="shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              Start Free — No Credit Card
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="xl" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5 hover:text-white">
              See How It Works
            </Button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-sm text-gray-500 mt-6"
        >
          2 free documents per month. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-3"
        >
          <Link
            href="/roast"
            className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <Flame className="h-4 w-4" />
            Or roast your resume free — no signup needed
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
