'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-6">
            Ready to land more interviews?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            6 tailored documents from a single job description. ATS-optimized,
            interview-ready, and built in under 60 seconds.
          </p>
          <Link href="/signup">
            <Button
              size="xl"
              variant="accent"
              className="shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required. 2 free documents every month.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
