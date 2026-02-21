'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RoastBanner() {
  return (
    <section className="bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5 border-y border-orange-500/10 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Flame className="h-10 w-10 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Not ready to sign up?
            </h3>
            <p className="text-gray-400">
              Get a free, brutally honest AI resume roast — no account needed.
            </p>
          </div>
        </div>

        <Link href="/roast" className="flex-shrink-0">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
          >
            Roast My Resume Free
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
