'use client'

import { useParams } from 'next/navigation'
import { CompanyDetail } from '@/components/ghostboard/company-detail'

export default function CompanyPage() {
  const params = useParams()
  const slug = params.slug as string

  return <CompanyDetail slug={slug} />
}
