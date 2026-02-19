/**
 * Country-specific resume format norms for 20 countries.
 * Used by the Country Resume generator to adapt output to local expectations.
 */

export interface CountryResumeFormat {
  code: string
  name: string
  region: string
  norms: {
    photo: 'required' | 'common' | 'optional' | 'discouraged'
    date_of_birth: boolean
    nationality: boolean
    marital_status: boolean
    page_limit: number | null
    preferred_format: 'resume' | 'cv'
    section_order: string[]
    language: string
  }
  cultural_tips: string[]
  interview_culture: string[]
}

export const COUNTRY_FORMATS: CountryResumeFormat[] = [
  {
    code: 'US',
    name: 'United States',
    region: 'North America',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 1,
      preferred_format: 'resume',
      section_order: ['header', 'summary', 'experience', 'skills', 'education', 'certifications'],
      language: 'English',
    },
    cultural_tips: [
      'Quantify achievements with numbers, percentages, and dollar amounts',
      'Keep to 1 page unless you have 10+ years of experience',
      'Never include a photo, date of birth, or marital status',
      'Use action verbs to start each bullet point',
    ],
    interview_culture: [
      'Be ready for behavioral questions using the STAR method',
      'Firm handshake and direct eye contact are expected',
      'Salary negotiation is common and expected after an offer',
      'Follow up with a thank-you email within 24 hours',
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'personal_statement', 'experience', 'education', 'skills', 'references'],
      language: 'English',
    },
    cultural_tips: [
      'Use "CV" rather than "resume" — the standard term in the UK',
      'Include a personal statement (profile) at the top',
      'Two pages is standard and expected for most roles',
      'Reference "right to work in the UK" if applicable, not nationality',
    ],
    interview_culture: [
      'Competency-based interviews are the norm in the UK',
      'Punctuality is critical — arrive 5-10 minutes early',
      'Salary expectations are often discussed earlier in the process',
      'Research the company thoroughly; interviewers appreciate genuine interest',
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    region: 'North America',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'resume',
      section_order: ['header', 'summary', 'experience', 'skills', 'education', 'certifications'],
      language: 'English',
    },
    cultural_tips: [
      'Very similar format to US resumes but 2 pages is acceptable',
      'Bilingual (English/French) skills are a major asset in many provinces',
      'Never include personal details like age, photo, or SIN',
      'Highlight volunteer work — highly valued in Canadian culture',
    ],
    interview_culture: [
      'Interviews tend to be friendly and conversational',
      'Expect behavioral and situational questions',
      'Discussing salary is typically left to later interview stages',
      'Demonstrating cultural fit and teamwork matters greatly',
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    region: 'Oceania',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 3,
      preferred_format: 'resume',
      section_order: ['header', 'career_objective', 'experience', 'education', 'skills', 'references'],
      language: 'English',
    },
    cultural_tips: [
      'Resumes can be 2-3 pages depending on experience',
      'Include a career objective or summary at the top',
      'Referees (references) are often listed directly on the resume',
      'Mention visa/work rights status if you are not a citizen',
    ],
    interview_culture: [
      'Australians value directness and authenticity over polish',
      'Casual tone is more accepted than in the US or UK',
      'Research the company but avoid being overly formal',
      'Salary ranges are often published in job ads',
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages', 'certifications'],
      language: 'German',
    },
    cultural_tips: [
      'A professional photo is expected at the top right of the CV',
      'Include date of birth and nationality as standard personal details',
      'Chronological format is strongly preferred — most recent first',
      'German CVs are highly structured; conciseness is valued',
      'Include language proficiency levels using CEFR scale (A1-C2)',
    ],
    interview_culture: [
      'Punctuality is absolutely essential — never be late',
      'Interviews are formal; use "Sie" (formal you) unless invited otherwise',
      'Qualifications and certifications carry significant weight',
      'Salary discussion happens later; research Glassdoor/Kununu for ranges',
    ],
  },
  {
    code: 'FR',
    name: 'France',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: false,
      page_limit: 1,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages', 'interests'],
      language: 'French',
    },
    cultural_tips: [
      'One page is standard for most roles in France',
      'A professional photo is commonly included',
      'Education is highly valued — list grande école or prestigious programs',
      'Include a "Centres d\'intérêt" (interests) section; it is culturally expected',
      'French CVs often include date of birth and nationality',
    ],
    interview_culture: [
      'Interviews blend professional and personal topics',
      'Expect questions about your motivation (\"Pourquoi ce poste?\")',
      'Formal dress code is standard; err on the side of overdressing',
      'The process can be lengthy with multiple rounds',
    ],
  },
  {
    code: 'NL',
    name: 'Netherlands',
    region: 'Europe',
    norms: {
      photo: 'optional',
      date_of_birth: true,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'personal_details', 'summary', 'experience', 'education', 'skills', 'languages'],
      language: 'Dutch',
    },
    cultural_tips: [
      'Photo is optional but common, especially in traditional industries',
      'Keep it concise — 1-2 pages maximum',
      'The Dutch value directness; be clear about what you bring',
      'Include language proficiency — English fluency is expected',
    ],
    interview_culture: [
      'Interviews are relatively informal and direct',
      'The Dutch value honesty and straightforwardness',
      'Expect practical questions about how you would handle situations',
      'Salary is often discussed openly early in the process',
    ],
  },
  {
    code: 'ES',
    name: 'Spain',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages'],
      language: 'Spanish',
    },
    cultural_tips: [
      'Photo is commonly included in Spanish CVs',
      'Include date of birth and nationality',
      'Europass format is widely recognized and accepted',
      'Highlight language skills prominently — Spanish + English minimum',
    ],
    interview_culture: [
      'Interviews may feel conversational and less structured',
      'Personal rapport matters — be warm and personable',
      'Hiring processes can be slower; patience is key',
      'Follow up politely after interviews',
    ],
  },
  {
    code: 'IT',
    name: 'Italy',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: true,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages'],
      language: 'Italian',
    },
    cultural_tips: [
      'Europass format is very commonly used in Italy',
      'Include a professional photo, date of birth, and nationality',
      'Marital status is still commonly included',
      'Highlight university degrees — education prestige matters',
      'Include privacy consent (D.Lgs 196/2003) at the bottom',
    ],
    interview_culture: [
      'Formal dress is expected; Italians are fashion-conscious',
      'Building personal rapport with the interviewer is important',
      'Expect questions about your educational background',
      'Hiring processes can be lengthy in large organizations',
    ],
  },
  {
    code: 'PL',
    name: 'Poland',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages'],
      language: 'Polish',
    },
    cultural_tips: [
      'Photo is commonly included in Polish CVs',
      'Include a GDPR consent clause at the bottom of the CV',
      'Education section is important, especially for early-career roles',
      'Highlight foreign language skills prominently',
    ],
    interview_culture: [
      'Interviews tend to be semi-formal',
      'Technical skills testing is common for IT roles',
      'Be prepared for multi-stage interview processes',
      'Salary negotiation usually happens after receiving an offer',
    ],
  },
  {
    code: 'IN',
    name: 'India',
    region: 'Asia',
    norms: {
      photo: 'optional',
      date_of_birth: true,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'resume',
      section_order: ['header', 'summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
      language: 'English',
    },
    cultural_tips: [
      'Resumes are typically 2 pages for experienced professionals',
      'Including a "Declaration" clause is traditional but becoming optional',
      'Technical certifications and project details are highly valued',
      'Tier-1 college affiliations carry significant weight',
    ],
    interview_culture: [
      'Multiple interview rounds are standard (phone, technical, HR)',
      'Salary negotiation is expected and common',
      'Reference checks are thorough in larger companies',
      'Notice periods of 2-3 months are common and expected',
    ],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    region: 'Oceania',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 3,
      preferred_format: 'cv',
      section_order: ['header', 'career_profile', 'experience', 'education', 'skills', 'references'],
      language: 'English',
    },
    cultural_tips: [
      'Similar to Australian CVs but with a Kiwi emphasis on community',
      'Volunteer work and community involvement are valued',
      'Reference availability is often listed on the CV itself',
      'Mention work visa status if not a citizen or permanent resident',
    ],
    interview_culture: [
      'Interviews are friendly and relatively informal',
      'Kiwi culture values humility — avoid bragging',
      'Cultural fit is extremely important in NZ workplaces',
      'Follow up with a thank-you email within 24 hours',
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    region: 'South America',
    norms: {
      photo: 'optional',
      date_of_birth: true,
      nationality: true,
      marital_status: true,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'personal_details', 'objective', 'experience', 'education', 'skills', 'languages'],
      language: 'Portuguese',
    },
    cultural_tips: [
      'Include a clear objective statement at the top',
      'Personal details (date of birth, marital status) are standard',
      'CPF number is NOT included on the CV',
      'Highlight language skills — English and Spanish are valuable',
    ],
    interview_culture: [
      'Interviews blend professional and personal conversation',
      'Building rapport and warmth is important in Brazilian culture',
      'Expect practical case studies or tests for technical roles',
      'Salary discussion typically happens in later rounds',
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    region: 'Asia',
    norms: {
      photo: 'optional',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'resume',
      section_order: ['header', 'summary', 'experience', 'skills', 'education', 'certifications'],
      language: 'English',
    },
    cultural_tips: [
      'Singapore follows a hybrid US/UK resume style',
      'Keep it concise — 1-2 pages preferred',
      'English is the business language; no need for translation',
      'Highlight international experience if applicable',
    ],
    interview_culture: [
      'Interviews are professional and structured',
      'Multiple rounds are common, including HR and hiring manager',
      'Expect questions about your willingness to relocate or travel',
      'Follow-up emails are appreciated and expected',
    ],
  },
  {
    code: 'AT',
    name: 'Austria',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages'],
      language: 'German',
    },
    cultural_tips: [
      'Very similar to German CVs — photo and personal details expected',
      'Academic titles (Mag., Dr., DI) are important and should be included',
      'Chronological format with most recent experience first',
      'Include language skills with proficiency levels',
    ],
    interview_culture: [
      'Formal and structured; use titles (Herr/Frau + academic title)',
      'Punctuality is essential — arrive 5 minutes early',
      'Qualifications and formal education carry significant weight',
      'Salary is discussed late in the process; research market rates',
    ],
  },
  {
    code: 'CH',
    name: 'Switzerland',
    region: 'Europe',
    norms: {
      photo: 'common',
      date_of_birth: true,
      nationality: true,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'experience', 'education', 'skills', 'languages'],
      language: 'German',
    },
    cultural_tips: [
      'Swiss CVs expect a professional photo and personal details',
      'Language skills are critical — German, French, Italian, and English',
      'Specify work permit type (B, C, L) if not a Swiss national',
      'Swiss employers value precision, reliability, and quality',
    ],
    interview_culture: [
      'Highly professional and formal interview culture',
      'Punctuality is non-negotiable in Switzerland',
      'Expect competency-based questions and potential case studies',
      'Salary ranges are high; research Swiss market rates carefully',
    ],
  },
  {
    code: 'SE',
    name: 'Sweden',
    region: 'Europe',
    norms: {
      photo: 'optional',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'summary', 'experience', 'education', 'skills', 'languages'],
      language: 'Swedish',
    },
    cultural_tips: [
      'Photo is optional and increasingly discouraged for equality reasons',
      'Swedish CVs are clean, concise, and understated',
      'Personal number (personnummer) is NOT included on the CV',
      'Highlight teamwork and flat-hierarchy collaboration skills',
    ],
    interview_culture: [
      'Interviews are relaxed and egalitarian in tone',
      'Expect questions about teamwork and cultural fit',
      'Swedish companies value work-life balance — mention this positively',
      'Salary is often set by collective agreements in many industries',
    ],
  },
  {
    code: 'IE',
    name: 'Ireland',
    region: 'Europe',
    norms: {
      photo: 'discouraged',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 2,
      preferred_format: 'cv',
      section_order: ['header', 'personal_statement', 'experience', 'education', 'skills', 'references'],
      language: 'English',
    },
    cultural_tips: [
      'Very similar to UK CVs — 2 pages with a personal statement',
      'Do not include photo, age, or marital status',
      'Highlight any EU work rights if not Irish/EU citizen',
      'Irish employers value personality and cultural fit',
    ],
    interview_culture: [
      'Interviews blend competency questions with conversational chat',
      'Irish culture values personability — be warm and approachable',
      'Prepare for questions about motivation and long-term goals',
      'Salary discussion usually happens at the offer stage',
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    region: 'Asia',
    norms: {
      photo: 'required',
      date_of_birth: true,
      nationality: true,
      marital_status: true,
      page_limit: null,
      preferred_format: 'cv',
      section_order: ['header', 'photo', 'personal_details', 'education', 'experience', 'skills', 'licenses', 'motivation'],
      language: 'Japanese',
    },
    cultural_tips: [
      'Use the standard rirekisho format for traditional companies',
      'A 3x4cm professional photo is required in the top-right corner',
      'Education comes BEFORE work experience in Japanese CVs',
      'Include a "motivation" section explaining why you want this role',
      'Handwritten CVs are still valued by some traditional companies',
    ],
    interview_culture: [
      'Extremely formal — bow, use keigo (formal Japanese), and dress conservatively',
      'Group interviews and panel interviews are common',
      'Loyalty and long-term commitment are highly valued',
      'Avoid asking about salary early; wait for the company to bring it up',
      'Thank-you notes after interviews are appreciated',
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    region: 'Africa',
    norms: {
      photo: 'optional',
      date_of_birth: false,
      nationality: false,
      marital_status: false,
      page_limit: 3,
      preferred_format: 'cv',
      section_order: ['header', 'personal_details', 'career_profile', 'experience', 'education', 'skills', 'references'],
      language: 'English',
    },
    cultural_tips: [
      'CVs can be 2-3 pages; include a career profile summary',
      'ID number is NOT included on the CV',
      'Reference details are commonly listed directly on the CV',
      'Highlight BEE/diversity experience if relevant to the role',
    ],
    interview_culture: [
      'Interviews are typically semi-formal and friendly',
      'Panel interviews are common in larger organizations',
      'Expect competency-based and behavioral questions',
      'Salary negotiation is common after receiving an offer',
    ],
  },
]

/** Look up a country format by ISO 3166-1 alpha-2 code (case-insensitive) */
export function getCountryFormat(code: string): CountryResumeFormat | undefined {
  return COUNTRY_FORMATS.find((f) => f.code === code.toUpperCase())
}

/** Get all countries in a given region */
export function getCountriesByRegion(region: string): CountryResumeFormat[] {
  return COUNTRY_FORMATS.filter((f) => f.region === region)
}

/** Get all unique regions */
export function getRegions(): string[] {
  return [...new Set(COUNTRY_FORMATS.map((f) => f.region))]
}

/** Human-readable summary of a country's resume norms */
export function getFormatSummary(code: string): string | null {
  const fmt = getCountryFormat(code)
  if (!fmt) return null

  const parts: string[] = []
  parts.push(`${fmt.name} uses the "${fmt.norms.preferred_format}" format`)
  if (fmt.norms.page_limit) {
    parts.push(`typically ${fmt.norms.page_limit} page${fmt.norms.page_limit > 1 ? 's' : ''}`)
  }
  parts.push(`in ${fmt.norms.language}`)

  const extras: string[] = []
  if (fmt.norms.photo === 'required') extras.push('photo required')
  else if (fmt.norms.photo === 'common') extras.push('photo commonly included')
  else if (fmt.norms.photo === 'discouraged') extras.push('no photo')
  if (fmt.norms.date_of_birth) extras.push('DOB included')
  if (fmt.norms.nationality) extras.push('nationality included')

  return parts.join(', ') + (extras.length ? '. ' + extras.join(', ') + '.' : '.')
}
