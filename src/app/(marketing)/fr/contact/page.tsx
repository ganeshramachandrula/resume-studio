'use client'

import { ContactContent } from '@/components/contact/contact-content'
import { translations } from '@/lib/i18n/translations'

export default function FrenchContactPage() {
  return <ContactContent t={translations.fr.contactPage} />
}
