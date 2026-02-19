import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, GENERAL_RATE_LIMIT, getClientIP, rateLimitResponse } from '@/lib/security/rate-limit'
import crypto from 'crypto'

// POST /api/share — create a share link for a document
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const body = await request.json()
    const { documentId } = body
    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
    }

    // Verify document belongs to user
    const { data: doc } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if already shared
    const { data: existing } = await supabase
      .from('shared_documents')
      .select('share_token')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ token: existing.share_token })
    }

    // Create share token
    const token = crypto.randomBytes(16).toString('hex')
    const { error } = await supabase
      .from('shared_documents')
      .insert({ document_id: documentId, user_id: user.id, share_token: token })

    if (error) {
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    return NextResponse.json({ token })
  } catch (error) {
    return safeErrorResponse(error, 'share-create')
  }
}

// GET /api/share?token=xxx — fetch a shared document (public, no auth)
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const rl = checkRateLimit(ip, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // Use service client to bypass RLS — this is a public endpoint authenticated by share token
    const supabase = getServiceClient()

    // Fetch shared document metadata
    const { data: share } = await supabase
      .from('shared_documents')
      .select('document_id, views')
      .eq('share_token', token)
      .single()

    if (!share) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    }

    // Fetch the actual document content
    const { data: doc } = await supabase
      .from('documents')
      .select('type, content, created_at, job_descriptions(company_name, role_title)')
      .eq('id', share.document_id)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Increment views (fire-and-forget)
    Promise.resolve(supabase.rpc('increment_share_views', { p_token: token })).catch(() => {})

    return NextResponse.json({
      type: doc.type,
      content: doc.content,
      createdAt: doc.created_at,
      company: (doc.job_descriptions as unknown as { company_name: string | null } | null)?.company_name || null,
      role: (doc.job_descriptions as unknown as { role_title: string | null } | null)?.role_title || null,
      views: share.views,
    })
  } catch (error) {
    return safeErrorResponse(error, 'share-get')
  }
}
