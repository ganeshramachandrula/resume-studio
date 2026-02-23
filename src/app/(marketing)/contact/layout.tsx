import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Resume Studio team. Questions about your account, billing, or features? We\'re here to help.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Resume Studio',
    description:
      'Get in touch with the Resume Studio team. We\'re here to help.',
    type: 'website',
    url: '/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us | Resume Studio',
    description: 'Get in touch with the Resume Studio team.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
