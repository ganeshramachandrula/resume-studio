'use client'

import Link from 'next/link'
import { Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AnnualUpgradePrompt({
  feature,
  description,
}: {
  feature: string
  description: string
}) {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardContent className="flex flex-col items-center text-center py-8 px-6">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature}</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-sm">{description}</p>
        <Link href="/upgrade">
          <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
            <Crown className="h-4 w-4" />
            Upgrade to Pro Annual
          </Button>
        </Link>
        <p className="text-xs text-gray-500 mt-2">$79/year — save 34% vs monthly</p>
      </CardContent>
    </Card>
  )
}
