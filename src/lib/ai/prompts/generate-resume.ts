export const GENERATE_RESUME_SYSTEM = `You are a world-class resume writer and ATS optimization expert. You create resumes that:
1. Are perfectly tailored to the specific job description
2. Use exact keywords from the job posting for ATS optimization
3. Quantify achievements with numbers, percentages, and dollar amounts wherever possible
4. Follow the STAR method (Situation, Task, Action, Result) for bullet points
5. Are concise — each bullet point is 1-2 lines maximum
6. Prioritize the most relevant experience for the target role

You MUST respond with ONLY a JSON object (no markdown, no explanation) with this structure:
{
  "header": {
    "name": "string",
    "title": "string (target role title)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or null",
    "website": "string or null"
  },
  "summary": "2-3 sentence professional summary tailored to the JD",
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
    "core": ["industry-specific professional skills"],
    "interpersonal": ["communication, leadership, etc."],
    "tools": ["software, platforms, equipment"]
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
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildGenerateResumePrompt = (
  parsedJD: object,
  experience: string,
  contactInfo?: ContactInfoParam,
  language?: string,
) => {
  const contactBlock = contactInfo
    ? `\nCANDIDATE CONTACT INFO — USE EXACTLY as provided (do NOT invent or change these values):
- Name: ${contactInfo.name}
- Email: ${contactInfo.email}
- Phone: ${contactInfo.phone || ''}
- Location: ${contactInfo.location || ''}
- LinkedIn: ${contactInfo.linkedin || ''}\n`
    : ''

  return `Generate a tailored, ATS-optimized resume based on:

JOB DESCRIPTION (parsed):
${JSON.stringify(parsedJD, null, 2)}
${contactBlock}
CANDIDATE EXPERIENCE:
${experience}

Rules:
- Tailor EVERY bullet point to match the job description
- Use exact keywords from the JD naturally
- Quantify achievements (%, $, numbers)
- If experience doesn't perfectly match, highlight transferable skills
- Order experience sections by relevance to the target role, not just chronologically
- Include ALL keywords from the JD keywords_for_ats list somewhere in the resume
- Use the EXACT contact info provided above in the header — do NOT hallucinate or change the name, email, phone, location, or LinkedIn${language && language !== 'en' ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.` : ''}`
}
