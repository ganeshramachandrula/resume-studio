'use client'

import Link from 'next/link'

export default function DashboardError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
      <p className="text-gray-400 mb-6 max-w-md">
        An error occurred while loading this page. Please try again or return to the dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={props.reset}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
