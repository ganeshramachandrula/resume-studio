import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roast My Resume — Free AI Resume Analyzer | Resume Studio',
  description:
    'Get a brutally honest, AI-powered resume analysis in seconds. Compare your resume against any job description — free, no signup required. See your ATS score, keyword gaps, and top fixes.',
  keywords: [
    'resume roast',
    'resume analyzer',
    'ATS score checker',
    'resume review',
    'AI resume feedback',
    'free resume checker',
    'resume score',
    'ATS compatibility',
  ],
  openGraph: {
    title: 'Roast My Resume — Free AI Resume Analyzer',
    description:
      'Get a brutally honest, AI-powered resume roast. See your score, keyword gaps, and top fixes — free, no signup.',
    type: 'website',
    url: '/roast',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roast My Resume — Free AI Resume Analyzer',
    description:
      'Get a brutally honest, AI-powered resume roast. See your score, keyword gaps, and top fixes — free, no signup.',
  },
}

export default function RoastLayout({ children }: { children: React.ReactNode }) {
  return children
}
