import type { Metadata } from "next"
import { DM_Sans, Instrument_Serif } from "next/font/google"
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
  title: {
    default: "Resume Studio — Tailored Career Documents in Seconds",
    template: "%s | Resume Studio",
  },
  description:
    "Generate tailored, ATS-optimized resumes, cover letters, LinkedIn summaries, cold emails, and interview prep. Start free.",
  keywords: [
    "resume builder",
    "smart resume",
    "ATS optimization",
    "cover letter generator",
    "LinkedIn summary",
    "interview prep",
    "job application",
    "career documents",
  ],
  authors: [{ name: "Resume Studio" }],
  openGraph: {
    type: "website",
    title: "Resume Studio — Tailored Career Documents in Seconds",
    description:
      "Generate tailored, ATS-optimized resumes, cover letters, and more in seconds.",
    siteName: "Resume Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Studio",
    description:
      "Smart career document generation. Land your dream job with one click.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  )
}
