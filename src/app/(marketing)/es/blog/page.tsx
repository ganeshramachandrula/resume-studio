import { BlogIndexContent } from '@/components/blog/blog-index-content'
import { translations } from '@/lib/i18n/translations'
import { getTranslatedBlogPosts } from '@/lib/blog/blog-translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'
import type { Metadata } from 'next'

const t = translations.es.blogPage

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: {
    canonical: '/es/blog',
    languages: hreflangAlternates('/blog'),
  },
}

export default function SpanishBlogIndexPage() {
  return <BlogIndexContent t={t} posts={getTranslatedBlogPosts('es')} basePath="/es/blog" />
}
