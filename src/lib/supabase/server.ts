import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, '')
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '')

function getUrl(): string {
  if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey.length > 20) {
    return supabaseUrl
  }
  return 'https://placeholder.supabase.co'
}

function getKey(): string {
  if (supabaseAnonKey && supabaseAnonKey.length > 20) {
    return supabaseAnonKey
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder-key-for-dev-mode-only'
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(getUrl(), getKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /* Server component, ignore */
        }
      },
    },
  })
}
