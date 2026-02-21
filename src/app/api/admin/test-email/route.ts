import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isEmailConfigured, sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    // Admin-only
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const configured = isEmailConfigured()
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST ? 'set' : 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT ? 'set' : 'MISSING',
      SMTP_USER: process.env.SMTP_USER ? `set (${process.env.SMTP_USER?.slice(0, 5)}...)` : 'MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? `set (${process.env.SMTP_PASS?.length} chars)` : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM || 'using default',
    }

    if (!configured) {
      return NextResponse.json({ configured: false, envCheck })
    }

    const body = await request.json().catch(() => ({})) as { to?: string }
    const to = body.to || 'support@resume-studio.io'

    const sent = await sendEmail({
      to,
      subject: 'Resume Studio SMTP Diagnostic Test',
      text: `This is a diagnostic test email sent at ${new Date().toISOString()} from production.`,
    })

    return NextResponse.json({ configured, envCheck, sent, to })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined,
    }, { status: 500 })
  }
}
