import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free AI Resume Builder',
  description:
    'Resume Studio pricing plans. Start free with 2 AI generations per month — no credit card required. Basic at $5.99/mo, Pro at $10.99/mo.',
  alternates: {
    canonical: '/pricing',
  },
  keywords: [
    'resume builder pricing',
    'free resume builder',
    'ai resume builder cost',
    'resume studio pricing',
    'ats resume builder free',
  ],
  openGraph: {
    title: 'Pricing — Free AI Resume Builder | Resume Studio',
    description:
      'Start free with 2 AI resume generations per month. No credit card required. Upgrade for more.',
    type: 'website',
    url: '/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Free AI Resume Builder | Resume Studio',
    description:
      'Start free with 2 AI resume generations per month. No credit card required.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
