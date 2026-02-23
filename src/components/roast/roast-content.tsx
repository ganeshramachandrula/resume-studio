'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, ChevronDown, Copy, Check, ArrowRight, AlertTriangle, Target, FileSearch, Lightbulb, Zap } from 'lucide-react'
import type { RoastResult } from '@/types/documents'
import type { LandingTranslation } from '@/lib/i18n/translations'

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    let start: number | null = null
    const duration = 1500
    function animate(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplayScore(Math.round(progress * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const offset = circumference - (displayScore / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{displayScore}</span>
        <span className="text-xs text-gray-400 mt-1">/ 100</span>
      </div>
    </div>
  )
}

function CategoryAccordion({
  title,
  icon,
  score,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  score: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const bg = score >= 75 ? 'bg-emerald-400/10' : score >= 50 ? 'bg-yellow-400/10' : 'bg-red-400/10'

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400">{icon}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-2 py-0.5 rounded ${bg} ${color}`}>
            {score}/100
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface RoastContentProps {
  t: LandingTranslation['roastPage']
}

export function RoastContent({ t }: RoastContentProps) {
  const [jd, setJd] = useState('')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % t.loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading, t.loadingMessages.length])

  const canSubmit = jd.length >= 50 && resume.length >= 50 && !loading

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setResult(null)
    setLoadingMsgIdx(0)

    try {
      const res = await fetch('/api/ai/roast-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, resumeText: resume }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setResult(data.data)

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, jd, resume])

  const shareText = result
    ? t.shareText.replace('{score}', String(result.overall_score))
    : ''

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(
      typeof window !== 'undefined' ? window.location.href : 'https://resume-studio.io/roast'
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
            <Flame className="h-4 w-4" />
            {t.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.jdLabel}
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder={t.jdPlaceholder}
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm"
              maxLength={15000}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${jd.length >= 50 ? 'text-gray-500' : 'text-orange-400'}`}>
                {jd.length.toLocaleString()}/15,000
              </span>
            </div>
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.resumeLabel}
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder={t.resumePlaceholder}
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none text-sm"
              maxLength={15000}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${resume.length >= 50 ? 'text-gray-500' : 'text-orange-400'}`}>
                {resume.length.toLocaleString()}/15,000
              </span>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
          >
            <Flame className="h-5 w-5" />
            {t.submitButton}
          </button>
          {jd.length > 0 && jd.length < 50 && (
            <p className="text-orange-400 text-xs mt-2">
              {t.jdMinChars}
            </p>
          )}
          {resume.length > 0 && resume.length < 50 && (
            <p className="text-orange-400 text-xs mt-2">
              {t.resumeMinChars}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-12 w-12 text-orange-400 mx-auto" />
              </motion.div>
              <p className="text-gray-400 mt-4 text-sm">{t.loadingMessages[loadingMsgIdx]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && !loading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Score + Verdict */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <ScoreRing score={result.overall_score} />
              </div>
              <p className="text-lg text-gray-300 max-w-xl mx-auto italic">
                &ldquo;{result.verdict}&rdquo;
              </p>
            </div>

            {/* Category Breakdowns */}
            <div className="space-y-3 max-w-3xl mx-auto mb-10">
              <CategoryAccordion
                title={t.keywordMatch}
                icon={<Target className="h-5 w-5" />}
                score={result.keyword_match.score}
                defaultOpen
              >
                <div className="pt-3 space-y-3">
                  {result.keyword_match.matched.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.matched}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keyword_match.matched.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.keyword_match.missing.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.missing}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keyword_match.missing.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CategoryAccordion>

              <CategoryAccordion
                title={t.impactScore}
                icon={<Zap className="h-5 w-5" />}
                score={result.impact_score.score}
              >
                <div className="pt-3 space-y-3">
                  {result.impact_score.strong_bullets.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.strongBullets}</p>
                      <ul className="space-y-1.5">
                        {result.impact_score.strong_bullets.map((b, i) => (
                          <li key={i} className="text-sm text-emerald-300 pl-3 border-l-2 border-emerald-500/30">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.impact_score.weak_bullets.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.weakBullets}</p>
                      <ul className="space-y-1.5">
                        {result.impact_score.weak_bullets.map((b, i) => (
                          <li key={i} className="text-sm text-red-300 pl-3 border-l-2 border-red-500/30">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CategoryAccordion>

              <CategoryAccordion
                title={t.atsCompatibility}
                icon={<FileSearch className="h-5 w-5" />}
                score={result.ats_compatibility.score}
              >
                <div className="pt-3">
                  {result.ats_compatibility.issues.length > 0 ? (
                    <ul className="space-y-2">
                      {result.ats_compatibility.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-emerald-400">{t.noAtsIssues}</p>
                  )}
                </div>
              </CategoryAccordion>

              <CategoryAccordion
                title={t.skillsGap}
                icon={<Lightbulb className="h-5 w-5" />}
                score={result.skills_gap.score}
              >
                <div className="pt-3 space-y-3">
                  {result.skills_gap.covered.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.covered}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skills_gap.covered.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.skills_gap.missing.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.missing}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skills_gap.missing.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CategoryAccordion>
            </div>

            {/* Formatting Issues */}
            {result.formatting_issues.length > 0 && (
              <div className="max-w-3xl mx-auto mb-10">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                  {t.formattingIssues}
                </h3>
                <ul className="space-y-2">
                  {result.formatting_issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top 3 Fixes */}
            <div className="max-w-3xl mx-auto mb-10">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                {t.top3Fixes}
              </h3>
              <div className="space-y-3">
                {result.top_3_fixes.map((fix, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/5 border border-orange-500/10"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-300">{fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Roast Lines */}
            <div className="max-w-3xl mx-auto mb-12">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                {t.theRoast}
              </h3>
              <div className="space-y-3">
                {result.roast_lines.map((line, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/10"
                  >
                    <p className="text-sm text-gray-200 italic">
                      <Flame className="h-4 w-4 text-orange-400 inline mr-2" />
                      &ldquo;{line}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Section */}
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                {t.shareYourScore}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://resume-studio.io/roast')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5]/10 border border-[#0077B5]/20 text-[#0077B5] text-sm hover:bg-[#0077B5]/20 transition-colors"
                >
                  {t.shareOnLinkedIn}
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://resume-studio.io/roast')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
                >
                  {t.shareOnX}
                </a>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t.copied : t.copyLink}
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-brand/10 to-accent/10 border border-brand/20">
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {t.ctaTitle}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {t.ctaSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
                >
                  {t.ctaButton}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-sm"
                >
                  {t.ctaPricing}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
