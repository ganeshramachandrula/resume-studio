import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { blogPosts } from '@/lib/blog/posts'
import { hreflangAlternates } from '@/lib/i18n/hreflang'
import { BlogPostJsonLd } from '@/components/seo/blog-json-ld'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
      languages: hreflangAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <article className="pt-32 pb-20 px-4">
      <BlogPostJsonLd post={post} />
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        <div
          className="prose prose-invert prose-gray max-w-none
            [&_h2]:text-2xl [&_h2]:font-display [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:mb-4 [&_li]:text-gray-300
            [&_ol]:space-y-2 [&_ol]:mb-4 [&_ol_li]:text-gray-300
            [&_strong]:text-white [&_em]:text-gray-200
            [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-brand/10 to-accent/10 border border-accent/20 text-center">
          <h3 className="text-xl font-display text-white mb-2">Try Resume Studio Free</h3>
          <p className="text-gray-400 text-sm mb-4">
            Generate ATS-optimized resumes, cover letters, and more in seconds.
          </p>
          <Link href="/signup">
            <Button variant="accent" size="lg">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
