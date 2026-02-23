'use client'

import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import type { LandingTranslation } from '@/lib/i18n/translations'

interface BlogPost {
  slug: string
  title: string
  description: string
  readTime: string
  publishedAt: string
}

interface BlogIndexContentProps {
  t: LandingTranslation['blogPage']
  posts: BlogPost[]
  /** Base path for blog post links, e.g. "/blog" or "/es/blog" */
  basePath: string
}

export function BlogIndexContent({ t, posts, basePath }: BlogIndexContentProps) {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
            {t.title}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`${basePath}/${post.slug}`}
              className="block group"
            >
              <article className="rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white group-hover:text-accent transition-colors mb-2 font-[family-name:var(--font-body)]">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-accent transition-colors shrink-0 mt-1" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
