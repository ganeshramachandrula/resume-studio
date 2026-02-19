import type { CountryResumeFormat } from '@/lib/resume-formats'

export const GENERATE_COUNTRY_RESUME_SYSTEM = `You are a world-class international resume writer who specializes in adapting resumes and career documents to country-specific norms. You understand local hiring conventions, cultural expectations, and ATS optimization for every major job market.

You MUST respond with ONLY a JSON object (no markdown, no explanation) matching this structure exactly:
{
  "resume": {
    "header": {
      "name": "string",
      "title": "string (target role title)",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string or null",
      "website": "string or null"
    },
    "summary": "2-3 sentence professional summary tailored to the JD and country norms",
    "experience": [
      {
        "company": "string",
        "title": "string",
        "location": "string",
        "start_date": "string",
        "end_date": "string or Present",
        "bullets": ["achievement1", "achievement2", "achievement3"]
      }
    ],
    "skills": {
      "core": ["professional skills"],
      "interpersonal": ["soft skills"],
      "tools": ["software, platforms"]
    },
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field": "string",
        "graduation_date": "string",
        "gpa": "string or null",
        "honors": "string or null"
      }
    ],
    "certifications": ["cert1", "cert2"],
    "ats_keywords_used": ["keyword1", "keyword2"]
  },
  "cover_letter": {
    "greeting": "string",
    "opening_paragraph": "string",
    "body_paragraphs": ["string"],
    "closing_paragraph": "string",
    "sign_off": "string"
  },
  "cultural_tips": {
    "work_culture": ["3-5 tips about the work culture in this country"],
    "communication_style": "string describing professional communication norms",
    "business_etiquette": ["3-5 business etiquette tips"],
    "common_mistakes": ["3-5 common mistakes expats/foreigners make when applying"]
  },
  "ats_analysis": {
    "overall_score": 85,
    "keyword_match": {
      "matched": ["keyword1", "keyword2"],
      "missing": ["keyword3"]
    },
    "country_notes": ["country-specific ATS considerations"],
    "format_compliance": "string assessment of format compliance with country norms"
  },
  "interview_tips": {
    "typical_process": "string describing the typical interview process",
    "dress_code": "string",
    "salary_discussion": "string about when and how to discuss salary",
    "follow_up": "string about follow-up etiquette",
    "common_questions": ["5 common interview questions for this country/role"]
  }
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

interface VaultDataParam {
  certificates?: { name: string; issuer: string }[]
  skills?: { name: string; proficiency: string }[]
}

export function buildCountryResumePrompt(
  parsedJD: object,
  experience: string,
  countryFormat: CountryResumeFormat,
  contactInfo?: ContactInfoParam,
  language?: string,
  vaultData?: VaultDataParam,
): string {
  const contactBlock = contactInfo
    ? `\nCANDIDATE CONTACT INFO — USE EXACTLY as provided (do NOT invent or change these values):
- Name: ${contactInfo.name}
- Email: ${contactInfo.email}
- Phone: ${contactInfo.phone || ''}
- Location: ${contactInfo.location || ''}
- LinkedIn: ${contactInfo.linkedin || ''}\n`
    : ''

  const vaultBlock = vaultData && (vaultData.certificates?.length || vaultData.skills?.length)
    ? `\nCANDIDATE CREDENTIALS FROM VAULT:
${vaultData.certificates?.length ? `Certificates: ${vaultData.certificates.map((c) => `${c.name} (${c.issuer})`).join(', ')}` : ''}
${vaultData.skills?.length ? `Skills: ${vaultData.skills.map((s) => `${s.name} [${s.proficiency}]`).join(', ')}` : ''}\n`
    : ''

  const normsBlock = `
TARGET COUNTRY: ${countryFormat.name} (${countryFormat.code})
COUNTRY-SPECIFIC RESUME NORMS:
- Preferred format: ${countryFormat.norms.preferred_format}
- Photo: ${countryFormat.norms.photo}
- Date of birth: ${countryFormat.norms.date_of_birth ? 'Include' : 'Do NOT include'}
- Nationality: ${countryFormat.norms.nationality ? 'Include' : 'Do NOT include'}
- Marital status: ${countryFormat.norms.marital_status ? 'Include' : 'Do NOT include'}
- Page limit: ${countryFormat.norms.page_limit ? `${countryFormat.norms.page_limit} page(s)` : 'No strict limit'}
- Section order: ${countryFormat.norms.section_order.join(' → ')}
- Business language: ${countryFormat.norms.language}

CULTURAL CONTEXT:
${countryFormat.cultural_tips.map((tip) => `- ${tip}`).join('\n')}

INTERVIEW CULTURE:
${countryFormat.interview_culture.map((tip) => `- ${tip}`).join('\n')}`

  const languageInstruction = language && language !== 'English'
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.`
    : ''

  return `Generate a complete, country-adapted resume package for ${countryFormat.name} based on:

JOB DESCRIPTION (parsed):
${JSON.stringify(parsedJD, null, 2)}
${contactBlock}${vaultBlock}
CANDIDATE EXPERIENCE:
${experience}
${normsBlock}

Rules:
- Adapt the resume format, section ordering, and content to ${countryFormat.name}'s norms
- Use exact keywords from the JD for ATS optimization
- Quantify achievements where possible
- Follow the section order specified for this country
- The cover letter should follow local greeting/closing conventions
- Cultural tips should be specific to this country and this industry/role
- ATS analysis should account for country-specific ATS conventions
- Interview tips should reflect local norms for this role level
- Use the EXACT contact info provided above in the header — do NOT hallucinate or change them
${vaultData?.certificates?.length ? '- Incorporate the candidate\'s vault certificates into the resume certifications section' : ''}
${vaultData?.skills?.length ? '- Incorporate the candidate\'s vault skills into the resume skills section' : ''}${languageInstruction}`
}
