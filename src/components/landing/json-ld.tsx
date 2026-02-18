import { faqStructuredData } from './faq'

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Resume Studio',
        url: baseUrl,
        description:
          'AI-powered career document generation. Create tailored resumes, cover letters, and more in seconds.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Resume Studio',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          'Generate ATS-optimized resumes, cover letters, LinkedIn summaries, cold emails, interview prep, and certification guides tailored to any job description.',
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'USD',
            description: '2 document generations per month with preview',
          },
          {
            '@type': 'Offer',
            name: 'Pro Monthly',
            price: '9.99',
            priceCurrency: 'USD',
            description: 'Unlimited generations, saved documents, no watermarks',
          },
          {
            '@type': 'Offer',
            name: 'Pro Annual',
            price: '79',
            priceCurrency: 'USD',
            description:
              'All Pro features plus premium templates, career coaching, and multi-language support',
          },
        ],
        featureList: [
          'ATS-optimized resume generation',
          'Cover letter tailoring',
          'LinkedIn summary optimization',
          'Cold outreach email drafting',
          'Interview preparation guides',
          'Certification guides',
          'AI career coaching',
          'Premium resume templates',
          'Multi-language support',
        ],
      },
      {
        '@type': 'WebSite',
        name: 'Resume Studio',
        url: baseUrl,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqStructuredData,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
