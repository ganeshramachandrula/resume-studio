'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FileText, Flame, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLocaleFromPathname, localePath } from '@/lib/i18n/locale'
import { translations, englishNav } from '@/lib/i18n/translations'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const nav = locale ? translations[locale].nav : englishNav

  const navLinks = [
    { href: localePath(locale, '/#features'), label: nav.features },
    { href: localePath(locale, '/#how-it-works'), label: nav.howItWorks },
    { href: localePath(locale, '/#pricing'), label: nav.pricing },
    { href: '/blog', label: nav.blog },
  ]

  const homeHref = localePath(locale, '/')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Resume Studio</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/roast"
              className="inline-flex items-center gap-1.5 transition-all hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent text-sm font-medium">
                {nav.roastMyResume}
              </span>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                {nav.roastFree}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                {nav.signIn}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="accent">{nav.getStartedFree}</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark/95 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-400 hover:text-white transition-colors text-sm py-2"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/roast"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2"
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent text-sm font-medium">
                {nav.roastMyResume}
              </span>
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                {nav.roastFree}
              </span>
            </Link>
            <div className="pt-3 border-t border-white/10 space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                  {nav.signIn}
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full">
                  {nav.getStartedFree}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
