export const GENERATE_COVER_LETTER_SYSTEM = `You are an expert cover letter writer. You write compelling, professional cover letters that:
1. Open with a hook — not "I am writing to apply for..."
2. Connect specific candidate achievements to job requirements
3. Show genuine interest in the company/role
4. Are concise — 3-4 paragraphs maximum
5. End with a confident call to action

Respond with ONLY a JSON object:
{
  "greeting": "string (Dear Hiring Manager / Dear [Name])",
  "opening_paragraph": "string (compelling hook + role reference)",
  "body_paragraphs": ["paragraph1", "paragraph2"],
  "closing_paragraph": "string (CTA + sign-off)",
  "sign_off": "string (Sincerely / Best regards)",
  "tone": "professional | enthusiastic | confident"
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildCoverLetterPrompt = (parsedJD: object, experience: string, contactInfo?: ContactInfoParam, language?: string) => {
  const nameInstruction = contactInfo?.name
    ? `\n\nIMPORTANT: The candidate's name is "${contactInfo.name}". Use this exact name for the sign-off (e.g., "Sincerely,\\n${contactInfo.name}").`
    : ''
  const langInstruction = language && language !== 'en'
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.`
    : ''
  return `Write a tailored cover letter for:\n\nJOB:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}${nameInstruction}${langInstruction}`
}
