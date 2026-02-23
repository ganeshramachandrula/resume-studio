import { describe, it, expect } from 'vitest'
import { translations, englishNav, englishRoastPage, englishContactPage, englishBlogPage } from '@/lib/i18n/translations'
import type { LandingTranslation } from '@/lib/i18n/translations'

const LOCALE_KEYS = ['es', 'fr', 'de', 'pt', 'hi'] as const
const REQUIRED_SECTIONS: (keyof LandingTranslation)[] = [
  'hero',
  'features',
  'howItWorks',
  'pricing',
  'faq',
  'cta',
  'nav',
  'roastPage',
  'contactPage',
  'blogPage',
]

describe('translations', () => {
  it('all locales have required sections: hero, features, howItWorks, pricing, faq, cta', () => {
    for (const locale of LOCALE_KEYS) {
      const t = translations[locale]
      expect(t).toBeDefined()
      for (const section of REQUIRED_SECTIONS) {
        expect(t[section], `${locale} is missing section "${section}"`).toBeDefined()
      }
    }
  })

  it('hero has all required fields', () => {
    const heroFields = [
      'badge',
      'title',
      'titleAccent',
      'subtitle',
      'ctaPrimary',
      'ctaSecondary',
      'freeNote',
    ] as const

    for (const locale of LOCALE_KEYS) {
      const hero = translations[locale].hero
      for (const field of heroFields) {
        expect(hero[field], `${locale}.hero.${field} is missing or empty`).toBeTruthy()
      }
    }
  })

  it('features.items has exactly 6 items per locale', () => {
    for (const locale of LOCALE_KEYS) {
      expect(
        translations[locale].features.items,
        `${locale} features.items length`
      ).toHaveLength(6)
    }
  })

  it('howItWorks.steps has exactly 4 steps per locale', () => {
    for (const locale of LOCALE_KEYS) {
      expect(
        translations[locale].howItWorks.steps,
        `${locale} howItWorks.steps length`
      ).toHaveLength(4)
    }
  })

  it('faq.items has at least 5 items per locale', () => {
    for (const locale of LOCALE_KEYS) {
      expect(
        translations[locale].faq.items.length,
        `${locale} faq.items should have >= 5 items`
      ).toBeGreaterThanOrEqual(5)
    }
  })

  it('each locale code matches its locale field', () => {
    for (const locale of LOCALE_KEYS) {
      expect(translations[locale].locale).toBe(locale)
    }
  })

  it('nav has all required keys matching englishNav', () => {
    const navKeys = Object.keys(englishNav) as (keyof typeof englishNav)[]
    for (const locale of LOCALE_KEYS) {
      const nav = translations[locale].nav
      for (const key of navKeys) {
        expect(nav[key], `${locale}.nav.${key} is missing or empty`).toBeTruthy()
      }
    }
  })

  it('englishNav has all non-empty string values', () => {
    for (const [key, value] of Object.entries(englishNav)) {
      expect(typeof value, `englishNav.${key} should be a string`).toBe('string')
      expect(value, `englishNav.${key} should not be empty`).toBeTruthy()
    }
  })

  it('roastPage has all required keys matching englishRoastPage', () => {
    const keys = Object.keys(englishRoastPage) as (keyof typeof englishRoastPage)[]
    for (const locale of LOCALE_KEYS) {
      const rp = translations[locale].roastPage
      for (const key of keys) {
        expect(rp[key], `${locale}.roastPage.${key} is missing`).toBeDefined()
      }
    }
  })

  it('roastPage.loadingMessages has 7 entries per locale', () => {
    for (const locale of LOCALE_KEYS) {
      expect(translations[locale].roastPage.loadingMessages).toHaveLength(7)
    }
  })

  it('contactPage has all required keys matching englishContactPage', () => {
    const keys = Object.keys(englishContactPage) as (keyof typeof englishContactPage)[]
    for (const locale of LOCALE_KEYS) {
      const cp = translations[locale].contactPage
      for (const key of keys) {
        expect(cp[key], `${locale}.contactPage.${key} is missing`).toBeTruthy()
      }
    }
  })

  it('blogPage has all required keys matching englishBlogPage', () => {
    const keys = Object.keys(englishBlogPage) as (keyof typeof englishBlogPage)[]
    for (const locale of LOCALE_KEYS) {
      const bp = translations[locale].blogPage
      for (const key of keys) {
        expect(bp[key], `${locale}.blogPage.${key} is missing`).toBeTruthy()
      }
    }
  })
})
