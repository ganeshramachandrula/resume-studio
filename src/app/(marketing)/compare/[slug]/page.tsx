import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { comparisonPages } from '@/lib/blog/comparisons'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return comparisonPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = comparisonPages.find((p) => p.slug === slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/compare/${slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
    },
  }
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params
  const page = comparisonPages.find((p) => p.slug === slug)
  if (!page) notFound()

  return (
    <article className="pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/#pricing" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display text-white mb-4 leading-tight">
            {page.title}
          </h1>
          <p className="text-gray-400 text-lg">{page.description}</p>
        </header>

        <div
          className="prose prose-invert prose-gray max-w-none
            [&_h2]:text-2xl [&_h2]:font-display [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:space-y-2 [&_ul]:mb-4 [&_li]:text-gray-300
            [&_strong]:text-white [&_em]:text-gray-200
            [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
            [&_th]:text-left [&_th]:text-white [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:bg-white/5
            [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5 [&_td]:text-gray-300
          "
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-brand/10 to-accent/10 border border-accent/20 text-center">
          <h3 className="text-xl font-display text-white mb-2">Try Resume Studio Free</h3>
          <p className="text-gray-400 text-sm mb-4">
            Generate your first ATS-optimized resume in under 60 seconds.
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
