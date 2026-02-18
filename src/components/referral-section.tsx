'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Gift, Copy, Check, Users } from 'lucide-react'

export function ReferralSection() {
  const [code, setCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/referral')
        if (res.ok) {
          const data = await res.json()
          setCode(data.code)
          setReferralCount(data.referralCount)
        }
      } catch {
        // ignore
      }
      setLoading(false)
    }
    load()
  }, [])

  const referralUrl = code
    ? `${window.location.origin}/signup?ref=${code}`
    : ''

  const handleCopy = async () => {
    if (!referralUrl) return
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-body)]">
          <Gift className="h-5 w-5 text-accent" />
          Refer a Friend
        </CardTitle>
        <CardDescription>
          Share your referral link. When someone signs up, you both get tracked for rewards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            readOnly
            value={referralUrl}
            className="bg-gray-50 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <><Check className="h-4 w-4" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4" /> Copy</>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <Users className="h-5 w-5 text-brand" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {referralCount} {referralCount === 1 ? 'person' : 'people'} signed up
            </p>
            <p className="text-xs text-gray-500">
              via your referral link
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
