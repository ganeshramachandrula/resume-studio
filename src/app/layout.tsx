import type { Metadata } from "next"
import { DM_Sans, Instrument_Serif } from "next/font/google"
import { GoogleAnalytics } from "@/components/analytics"
import { hreflangAlternates } from "@/lib/i18n/hreflang"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'),
  title: {
    default: "Resume Studio — Tailored Career Documents in Seconds",
    template: "%s | Resume Studio",
  },
  description:
    "Generate tailored, ATS-optimized resumes, cover letters, LinkedIn summaries, cold emails, and interview prep. Start free.",
  keywords: [
    "resume builder",
    "ai resume builder",
    "free resume builder",
    "ATS optimization",
    "ats resume checker",
    "ats score checker",
    "cover letter generator",
    "LinkedIn summary generator",
    "interview prep ai",
    "job application ai",
    "career documents",
    "resume tailor",
    "cold email generator",
    "roast my resume",
    "career coach ai",
    "resume optimizer",
  ],
  authors: [{ name: "Resume Studio" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "Resume Studio — Tailored Career Documents in Seconds",
    description:
      "Generate tailored, ATS-optimized resumes, cover letters, and more in seconds.",
    siteName: "Resume Studio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Resume Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Studio",
    description:
      "Smart career document generation. Land your dream job with one click.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "DlhGeazR4A-yC7q6DGtvtMkoTPsiPhvU68faDIkGnEE",
    other: { "msvalidate.01": "5C88E0157366D17E88ED44C8DAB2573C" },
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
    languages: hreflangAlternates('/'),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
