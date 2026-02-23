import type { BlogPost } from '@/lib/blog/posts'

const BASE_URL = 'https://resume-studio.io'

export function BlogPostJsonLd({ post }: { post: BlogPost }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Resume Studio',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Resume Studio',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    image: `${BASE_URL}/og-image.png`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
