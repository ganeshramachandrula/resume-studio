'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, Check, ChevronDown, FileText, Target, Zap, Layout, Briefcase, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { detectLocalCurrency, formatLocalPrice } from '@/lib/i18n/currencies'
import type { LandingTranslation } from '@/lib/i18n/translations'

const featureIcons = [FileText, Target, Zap, Layout, Briefcase, BookOpen]

export function TranslatedLanding({ t }: { t: LandingTranslation }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [localCurrency, setLocalCurrency] = useState<ReturnType<typeof detectLocalCurrency>>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only API on mount
  useEffect(() => { setLocalCurrency(detectLocalCurrency()) }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/20 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-gray-300">{t.hero.badge}</span>
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-display text-white max-w-4xl mx-auto leading-tight mb-6">
            {t.hero.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
              {t.hero.titleAccent}
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            {t.hero.subtitle}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" variant="accent" className="shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="xl" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5 hover:text-white">
                {t.hero.ctaSecondary}
              </Button>
            </a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-sm text-gray-500 mt-6">
            {t.hero.freeNote}
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-display text-white text-center mb-16">
            {t.features.title}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.features.items.map((item, i) => {
              const Icon = featureIcons[i] || FileText
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <Icon className="h-8 w-8 text-accent mb-4" />
                  <h3 className="text-white font-semibold mb-2 font-[family-name:var(--font-body)]">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-display text-white mb-4">
            {t.howItWorks.title}
          </motion.h2>
          <p className="text-gray-400 text-lg mb-12">{t.howItWorks.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {t.howItWorks.steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-bold text-lg mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="text-white font-semibold mb-2 font-[family-name:var(--font-body)]">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">{t.pricing.title}</h2>
            <p className="text-gray-400 text-lg">{t.pricing.subtitle}</p>
            {localCurrency && (
              <p className="text-gray-500 text-sm mt-2">
                Prices shown in USD. Approximate {localCurrency.code} equivalents shown below.
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[t.pricing.free, t.pricing.basic, t.pricing.pro].map((plan, i) => {
              const prices = ['$0', '$5.99', '$10.99']
              const usdAmounts = [0, 5.99, 10.99]
              const isPopular = i === 2
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative rounded-2xl p-6 ${isPopular ? 'bg-gradient-to-b from-brand/20 to-accent/10 border-2 border-accent/40' : 'bg-white/5 border border-white/10'}`}>
                  {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</div>}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-1 font-[family-name:var(--font-body)]">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{prices[i]}</span>
                    <span className="text-gray-400 text-sm">/month</span>
                    {usdAmounts[i] > 0 && (
                      <p className="text-gray-500 text-xs mt-1">+ applicable tax</p>
                    )}
                    {localCurrency && usdAmounts[i] > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        {formatLocalPrice(usdAmounts[i], localCurrency)}/month
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <Button className="w-full" variant={isPopular ? 'accent' : 'outline'} size="lg">{plan.cta}</Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Credit Pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mt-6"
          >
            <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">{t.pricing.creditPack}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">{t.faq.title}</h2>
            <p className="text-gray-400 text-lg">{t.faq.subtitle}</p>
          </motion.div>
          <div className="space-y-3">
            {t.faq.items.map((faq, i) => (
              <button key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white font-medium text-sm">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{faq.answer}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-display text-white mb-6">{t.cta.title}</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">{t.cta.subtitle}</p>
            <Link href="/signup">
              <Button size="xl" variant="accent" className="shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                {t.cta.button}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">{t.cta.note}</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
