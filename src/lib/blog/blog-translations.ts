import type { SupportedLocale } from '@/lib/i18n/locale'

/** Translated blog post metadata for the blog index page */
export interface TranslatedBlogPost {
  slug: string
  title: string
  description: string
  readTime: string
  publishedAt: string
}

const translatedPosts: Record<SupportedLocale, TranslatedBlogPost[]> = {
  es: [
    {
      slug: 'beat-ats-systems-2026',
      title: 'Como superar los sistemas ATS en 2026: La guia completa',
      description: 'Aprende como funcionan los sistemas de seguimiento de candidatos en 2026 y descubre estrategias probadas para que tu curriculum pase los filtros ATS.',
      publishedAt: '2026-02-15',
      readTime: '9 min de lectura',
    },
    {
      slug: 'resume-keywords-get-interviews',
      title: '50 palabras clave para el curriculum que realmente consiguen entrevistas',
      description: 'Descubre 50 palabras clave de alto impacto organizadas por industria y funcion, ademas de como integrarlas de forma natural.',
      publishedAt: '2026-02-15',
      readTime: '10 min de lectura',
    },
    {
      slug: 'cover-letter-vs-no-cover-letter',
      title: 'Carta de presentacion vs sin carta: Que piensan realmente los reclutadores',
      description: 'Deberias escribir una carta de presentacion en 2026? Analizamos los datos y te decimos exactamente cuando ayuda y cuando puedes prescindir de ella.',
      publishedAt: '2026-02-15',
      readTime: '8 min de lectura',
    },
    {
      slug: 'tailor-resume-every-job',
      title: 'Como adaptar tu curriculum para cada oferta (sin empezar de cero)',
      description: 'Aprende un sistema practico para personalizar tu curriculum para cada solicitud en 15 minutos o menos.',
      publishedAt: '2026-02-15',
      readTime: '9 min de lectura',
    },
    {
      slug: 'linkedin-summary-examples',
      title: 'Ejemplos de resumen de LinkedIn que atraen a los reclutadores',
      description: 'Aprende la formula para escribir un resumen de LinkedIn que atraiga reclutadores, con 4 ejemplos reales que puedes adaptar.',
      publishedAt: '2026-02-15',
      readTime: '8 min de lectura',
    },
  ],
  fr: [
    {
      slug: 'beat-ats-systems-2026',
      title: 'Comment battre les systemes ATS en 2026 : Le guide complet',
      description: 'Decouvrez comment fonctionnent les ATS en 2026 et les strategies eprouvees pour que votre CV passe les filtres.',
      publishedAt: '2026-02-15',
      readTime: '9 min de lecture',
    },
    {
      slug: 'resume-keywords-get-interviews',
      title: '50 mots-cles de CV qui decrochent vraiment des entretiens',
      description: 'Decouvrez 50 mots-cles a fort impact organises par secteur et fonction, avec des conseils pour les integrer naturellement.',
      publishedAt: '2026-02-15',
      readTime: '10 min de lecture',
    },
    {
      slug: 'cover-letter-vs-no-cover-letter',
      title: 'Lettre de motivation ou pas : Ce que pensent vraiment les recruteurs',
      description: 'Faut-il ecrire une lettre de motivation en 2026 ? Nous analysons les donnees et vous disons exactement quand elle aide.',
      publishedAt: '2026-02-15',
      readTime: '8 min de lecture',
    },
    {
      slug: 'tailor-resume-every-job',
      title: 'Comment adapter votre CV a chaque offre (sans tout recommencer)',
      description: 'Apprenez un systeme pratique pour personnaliser votre CV pour chaque candidature en 15 minutes ou moins.',
      publishedAt: '2026-02-15',
      readTime: '9 min de lecture',
    },
    {
      slug: 'linkedin-summary-examples',
      title: 'Exemples de resume LinkedIn qui attirent les recruteurs',
      description: 'La formule pour ecrire un resume LinkedIn qui attire les recruteurs, avec 4 exemples reels a adapter.',
      publishedAt: '2026-02-15',
      readTime: '8 min de lecture',
    },
  ],
  de: [
    {
      slug: 'beat-ats-systems-2026',
      title: 'ATS-Systeme 2026 ueberwinden: Der komplette Leitfaden',
      description: 'Erfahren Sie, wie ATS-Systeme 2026 funktionieren, und entdecken Sie bewaehrte Strategien, um Ihren Lebenslauf durch die Filter zu bringen.',
      publishedAt: '2026-02-15',
      readTime: '9 Min. Lesezeit',
    },
    {
      slug: 'resume-keywords-get-interviews',
      title: '50 Lebenslauf-Schluesselwoerter, die wirklich zu Vorstellungsgespraechen fuehren',
      description: 'Entdecken Sie 50 wirkungsvolle Schluesselwoerter nach Branche und Funktion, mit Tipps zur natuerlichen Integration.',
      publishedAt: '2026-02-15',
      readTime: '10 Min. Lesezeit',
    },
    {
      slug: 'cover-letter-vs-no-cover-letter',
      title: 'Anschreiben ja oder nein: Was Personalverantwortliche wirklich denken',
      description: 'Sollten Sie 2026 ein Anschreiben verfassen? Wir analysieren die Daten und sagen Ihnen genau, wann es hilft.',
      publishedAt: '2026-02-15',
      readTime: '8 Min. Lesezeit',
    },
    {
      slug: 'tailor-resume-every-job',
      title: 'Lebenslauf fuer jede Bewerbung anpassen (ohne von vorne zu beginnen)',
      description: 'Lernen Sie ein praktisches System, um Ihren Lebenslauf in 15 Minuten oder weniger an jede Stelle anzupassen.',
      publishedAt: '2026-02-15',
      readTime: '9 Min. Lesezeit',
    },
    {
      slug: 'linkedin-summary-examples',
      title: 'LinkedIn-Zusammenfassungen, die Recruiter ueberzeugen',
      description: 'Die Formel fuer eine LinkedIn-Zusammenfassung, die Recruiter anzieht, mit 4 Praxisbeispielen zum Anpassen.',
      publishedAt: '2026-02-15',
      readTime: '8 Min. Lesezeit',
    },
  ],
  pt: [
    {
      slug: 'beat-ats-systems-2026',
      title: 'Como vencer os sistemas ATS em 2026: O guia completo',
      description: 'Aprenda como os ATS funcionam em 2026 e descubra estrategias comprovadas para passar seu curriculo pelos filtros.',
      publishedAt: '2026-02-15',
      readTime: '9 min de leitura',
    },
    {
      slug: 'resume-keywords-get-interviews',
      title: '50 palavras-chave de curriculo que realmente geram entrevistas',
      description: 'Descubra 50 palavras-chave de alto impacto organizadas por setor e funcao, com dicas de integracao natural.',
      publishedAt: '2026-02-15',
      readTime: '10 min de leitura',
    },
    {
      slug: 'cover-letter-vs-no-cover-letter',
      title: 'Carta de apresentacao ou nao: O que os recrutadores realmente pensam',
      description: 'Voce deveria escrever uma carta de apresentacao em 2026? Analisamos os dados e dizemos exatamente quando ela ajuda.',
      publishedAt: '2026-02-15',
      readTime: '8 min de leitura',
    },
    {
      slug: 'tailor-resume-every-job',
      title: 'Como adaptar seu curriculo para cada vaga (sem comecar do zero)',
      description: 'Aprenda um sistema pratico para personalizar seu curriculo para cada candidatura em 15 minutos ou menos.',
      publishedAt: '2026-02-15',
      readTime: '9 min de leitura',
    },
    {
      slug: 'linkedin-summary-examples',
      title: 'Exemplos de resumo do LinkedIn que atraem recrutadores',
      description: 'A formula para escrever um resumo do LinkedIn que atrai recrutadores, com 4 exemplos reais para adaptar.',
      publishedAt: '2026-02-15',
      readTime: '8 min de leitura',
    },
  ],
  hi: [
    {
      slug: 'beat-ats-systems-2026',
      title: '2026 mein ATS Systems ko kaise beat karein: Complete Guide',
      description: 'Jaaniye ATS systems 2026 mein kaise kaam karte hain aur apne resume ko filters se paas karne ki proven strategies.',
      publishedAt: '2026-02-15',
      readTime: '9 min padhne ka samay',
    },
    {
      slug: 'resume-keywords-get-interviews',
      title: '50 Resume Keywords jo sachchi mein interviews dilate hain',
      description: '50 high-impact resume keywords industry aur function ke hisaab se, saath mein unhe naturally integrate karne ke tips.',
      publishedAt: '2026-02-15',
      readTime: '10 min padhne ka samay',
    },
    {
      slug: 'cover-letter-vs-no-cover-letter',
      title: 'Cover Letter ya nahi: Hiring Managers kya sochte hain',
      description: 'Kya 2026 mein cover letter likhna chahiye? Data dekhein aur jaanein kab cover letter se fayda hota hai.',
      publishedAt: '2026-02-15',
      readTime: '8 min padhne ka samay',
    },
    {
      slug: 'tailor-resume-every-job',
      title: 'Har job ke liye resume kaise customize karein (bina shuru se likhein)',
      description: 'Har application ke liye resume ko 15 minute mein customize karne ka practical system seekhein.',
      publishedAt: '2026-02-15',
      readTime: '9 min padhne ka samay',
    },
    {
      slug: 'linkedin-summary-examples',
      title: 'LinkedIn Summary ke examples jo recruiters ko attract karte hain',
      description: 'LinkedIn summary likhne ka formula jo recruiters ko click karne par majboor kare, 4 real examples ke saath.',
      publishedAt: '2026-02-15',
      readTime: '8 min padhne ka samay',
    },
  ],
}

export function getTranslatedBlogPosts(locale: SupportedLocale): TranslatedBlogPost[] {
  return translatedPosts[locale]
}
