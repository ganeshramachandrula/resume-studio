'use client'

import { ContactContent } from '@/components/contact/contact-content'
import { englishContactPage } from '@/lib/i18n/translations'

export default function ContactPage() {
  return <ContactContent t={englishContactPage} />
}
