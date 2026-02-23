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
        logo: `${baseUrl}/icon.svg`,
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
            description: '2 AI generations per month, 3 templates, ATS scoring, PDF downloads with watermark',
          },
          {
            '@type': 'Offer',
            name: 'Basic Monthly',
            price: '5.99',
            priceCurrency: 'USD',
            description: '10 AI generations per month, all 13 templates, saved documents, no watermarks',
          },
          {
            '@type': 'Offer',
            name: 'Pro Monthly',
            price: '10.99',
            priceCurrency: 'USD',
            description: '20 AI generations per month, premium fonts, multi-language support, AI career coaching',
          },
          {
            '@type': 'Offer',
            name: 'Credit Pack',
            price: '2.99',
            priceCurrency: 'USD',
            description: '3 additional AI generations, one-time purchase, credits never expire',
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
