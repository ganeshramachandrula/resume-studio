import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/documents/:path*',
    '/job-tracker/:path*',
    '/settings/:path*',
    '/career-coach/:path*',
    '/admin/:path*',
    '/team/:path*',
    '/login',
    '/signup',
  ],
}
