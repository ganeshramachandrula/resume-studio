'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText } from 'lucide-react'
import { getLocaleFromPathname, localePath, SUPPORTED_LOCALES } from '@/lib/i18n/locale'
import { translations, englishNav } from '@/lib/i18n/translations'

export function Footer() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const nav = locale ? translations[locale].nav : englishNav

  const homeHref = localePath(locale, '/')

  // Build language links: all locales except current, plus "English" when on non-English page
  const languageLinks: Array<{ href: string; label: string }> = []
  if (locale) {
    languageLinks.push({ href: '/', label: 'English' })
  }
  for (const loc of SUPPORTED_LOCALES) {
    if (loc !== locale) {
      languageLinks.push({ href: `/${loc}`, label: translations[loc].nativeName })
    }
  }

  return (
    <footer className="bg-dark border-t border-white/10 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href={homeHref} className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">Resume Studio</span>
            </Link>
            <p className="text-sm">
              {nav.tagline}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{nav.product}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={localePath(locale, '/#features')} className="hover:text-white transition-colors">{nav.features}</a></li>
              <li><a href={localePath(locale, '/#pricing')} className="hover:text-white transition-colors">{nav.pricing}</a></li>
              <li><a href={localePath(locale, '/#how-it-works')} className="hover:text-white transition-colors">{nav.howItWorks}</a></li>
              <li><a href={localePath(locale, '/#faq')} className="hover:text-white transition-colors">{nav.faq}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{nav.resources}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">{nav.blog}</Link></li>
              <li><Link href="/compare/chatgpt" className="hover:text-white transition-colors">vs ChatGPT</Link></li>
              <li><Link href="/compare/indeed" className="hover:text-white transition-colors">vs Indeed</Link></li>
              <li><Link href="/compare/linkedin" className="hover:text-white transition-colors">vs LinkedIn</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{nav.documents}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">{nav.resumeBuilder}</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">{nav.coverLetter}</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">{nav.linkedInSummary}</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">{nav.interviewPrep}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{nav.support}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">{nav.contactUs}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{nav.privacyPolicy}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{nav.termsOfService}</Link></li>
            </ul>
          </div>
        </div>

        {/* Language links */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>{nav.alsoAvailableIn}</span>
          {locale && (
            <span className="text-white font-medium">
              {translations[locale].nativeName}
            </span>
          )}
          {!locale && (
            <span className="text-white font-medium">English</span>
          )}
          {languageLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm">
          &copy; {new Date().getFullYear()} Resume Studio. {nav.allRightsReserved}
        </div>
      </div>
    </footer>
  )
}
