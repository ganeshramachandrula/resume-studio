'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    location: 'Bangalore, India',
    quote:
      'I applied to 12 companies in one weekend using Resume Studio. The ATS score feature alone saved me hours of guessing which keywords to include. Got 4 interview calls within a week.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager',
    location: 'Austin, TX',
    quote:
      'The fact that it generates a cover letter, LinkedIn summary, AND interview prep from one job description is incredible. I stopped using three separate tools and just use this now.',
    rating: 5,
  },
  {
    name: 'Elena Vasquez',
    role: 'Data Analyst',
    location: 'Madrid, Spain',
    quote:
      'Being able to generate documents in Spanish for local roles and English for international ones — all from the same platform — is exactly what I needed for my job search across Europe.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'UX Designer',
    location: 'Seoul, South Korea',
    quote:
      'Clean, fast, no nonsense. Paste the JD, get your package, apply. I recommended this to my entire design cohort and they all switched from ChatGPT prompts.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
            Trusted by job seekers worldwide
          </h2>
          <p className="text-gray-400 text-lg">
            Real results from real people using Resume Studio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-semibold text-sm">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-gray-500 text-xs">
                    {t.role} &middot; {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
