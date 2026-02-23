import { blogPosts } from '@/lib/blog/posts'
import { BlogIndexContent } from '@/components/blog/blog-index-content'
import { englishBlogPage } from '@/lib/i18n/translations'
import { hreflangAlternates } from '@/lib/i18n/hreflang'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: englishBlogPage.metaTitle,
  description: englishBlogPage.metaDescription,
  alternates: {
    canonical: '/blog',
    languages: hreflangAlternates('/blog'),
  },
}

export default function BlogIndexPage() {
  return <BlogIndexContent t={englishBlogPage} posts={blogPosts} basePath="/blog" />
}
