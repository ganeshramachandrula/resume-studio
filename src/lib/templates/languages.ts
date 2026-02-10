export interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

export const PRESET_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'fr', name: 'French', nativeName: 'Francais' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
]

// Languages that may not render properly in PDF (CJK + Arabic)
export const PDF_UNSUPPORTED_LANGUAGES = ['zh', 'ja', 'ko', 'ar', 'hi']

export function getLanguageName(code: string): string {
  const preset = PRESET_LANGUAGES.find((l) => l.code === code)
  return preset ? preset.name : code
}
