'use client'

import { useState } from 'react'
import { Share2, Linkedin, Link, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  documentId?: string
  disabled?: boolean
}

export function ShareButton({ documentId, disabled }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const createShareLink = async () => {
    if (!documentId) return
    setLoading(true)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      if (res.ok) {
        const data = await res.json()
        const url = `${window.location.origin}/share/${data.token}`
        setShareUrl(url)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const handleOpen = async () => {
    if (!shareUrl) await createShareLink()
    setOpen(true)
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkedIn = () => {
    if (!shareUrl) return
    const text = encodeURIComponent(
      `Just tailored my resume with Resume Studio — AI-powered, ATS-optimized, and ready in seconds.\n\n${shareUrl}`
    )
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&text=${text}`,
      '_blank',
      'width=600,height=500'
    )
  }

  if (disabled || !documentId) return null

  return (
    <div className="relative">
      <Button size="sm" variant="outline" onClick={handleOpen} disabled={loading}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {open && shareUrl && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border shadow-lg p-3 w-64">
            <p className="text-xs text-gray-500 mb-2 font-medium">Share this document</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-[#0077B5]"
                onClick={handleLinkedIn}
              >
                <Linkedin className="h-4 w-4" />
                Share on LinkedIn
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
