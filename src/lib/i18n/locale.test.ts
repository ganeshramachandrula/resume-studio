import { describe, it, expect } from 'vitest'
import {
  SUPPORTED_LOCALES,
  getLocaleFromPathname,
  localePath,
} from '@/lib/i18n/locale'

describe('SUPPORTED_LOCALES', () => {
  it('contains exactly 5 locales', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(5)
    expect([...SUPPORTED_LOCALES]).toEqual(['es', 'fr', 'de', 'pt', 'hi'])
  })
})

describe('getLocaleFromPathname', () => {
  it('returns locale for locale paths', () => {
    expect(getLocaleFromPathname('/es')).toBe('es')
    expect(getLocaleFromPathname('/fr')).toBe('fr')
    expect(getLocaleFromPathname('/de')).toBe('de')
    expect(getLocaleFromPathname('/pt')).toBe('pt')
    expect(getLocaleFromPathname('/hi')).toBe('hi')
  })

  it('returns locale when path has hash fragment', () => {
    expect(getLocaleFromPathname('/es#features')).toBe('es')
  })

  it('returns locale for locale-prefixed marketing paths', () => {
    expect(getLocaleFromPathname('/es/blog')).toBe('es')
    expect(getLocaleFromPathname('/fr/roast')).toBe('fr')
    expect(getLocaleFromPathname('/de/contact')).toBe('de')
  })

  it('returns null for root path', () => {
    expect(getLocaleFromPathname('/')).toBeNull()
  })

  it('returns null for non-locale paths', () => {
    expect(getLocaleFromPathname('/blog')).toBeNull()
    expect(getLocaleFromPathname('/login')).toBeNull()
    expect(getLocaleFromPathname('/signup')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getLocaleFromPathname('')).toBeNull()
  })
})

describe('localePath', () => {
  it('returns path unchanged when locale is null', () => {
    expect(localePath(null, '/')).toBe('/')
    expect(localePath(null, '/#features')).toBe('/#features')
    expect(localePath(null, '/blog')).toBe('/blog')
  })

  it('prefixes root with locale', () => {
    expect(localePath('es', '/')).toBe('/es')
    expect(localePath('fr', '/')).toBe('/fr')
  })

  it('prefixes anchor links with locale', () => {
    expect(localePath('es', '/#features')).toBe('/es#features')
    expect(localePath('de', '/#how-it-works')).toBe('/de#how-it-works')
    expect(localePath('fr', '/#pricing')).toBe('/fr#pricing')
    expect(localePath('pt', '/#faq')).toBe('/pt#faq')
  })

  it('prefixes localizable marketing paths with locale', () => {
    expect(localePath('es', '/blog')).toBe('/es/blog')
    expect(localePath('fr', '/roast')).toBe('/fr/roast')
    expect(localePath('de', '/contact')).toBe('/de/contact')
    expect(localePath('pt', '/pricing')).toBe('/pt/pricing')
  })

  it('prefixes sub-paths of localizable marketing paths', () => {
    expect(localePath('es', '/blog/resume-tips')).toBe('/es/blog/resume-tips')
  })

  it('leaves auth/app paths unchanged', () => {
    expect(localePath('fr', '/login')).toBe('/login')
    expect(localePath('de', '/signup')).toBe('/signup')
    expect(localePath('hi', '/dashboard')).toBe('/dashboard')
  })
})
