import type { Metadata } from 'next'
import { hreflangAlternates } from '@/lib/i18n/hreflang'

const title = 'GhostBoard — Rate Company Hiring Experiences | Resume Studio'
const description = 'See which companies ghost applicants, have slow response times, or unfair hiring practices. Rate your own experience and help job seekers make informed decisions.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/ghostboard',
    languages: hreflangAlternates('/ghostboard'),
  },
  keywords: [
    'company hiring reviews',
    'employer ghosting',
    'hiring experience ratings',
    'interview process reviews',
    'company application reviews',
    'recruiter ratings',
    'ghostboard',
    'hiring transparency',
  ],
  openGraph: {
    title,
    description,
    type: 'website',
    url: '/ghostboard',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function GhostBoardLayout({ children }: { children: React.ReactNode }) {
  return children
}
