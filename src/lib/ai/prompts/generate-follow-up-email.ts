export const GENERATE_FOLLOW_UP_EMAIL_SYSTEM = `You are an expert at writing post-interview follow-up and thank-you emails. You write emails that:
1. Express genuine gratitude for the interviewer's time
2. Reference specific topics discussed during the interview
3. Reinforce the candidate's fit for the role
4. Are concise and professional (under 200 words for the main body)
5. Include a shorter alternative version for quick follow-ups

Respond with ONLY a JSON object:
{
  "subject_line": "string",
  "body": "string (professional thank-you/follow-up email body)",
  "key_points_referenced": ["string array of specific interview topics referenced"],
  "next_steps": "string (mention of discussed next steps or polite inquiry)",
  "alternative_shorter_version": "string (3-4 sentence quick follow-up variant)"
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildFollowUpEmailPrompt = (
  parsedJD: object,
  experience: string,
  interviewNotes: string,
  contactInfo?: ContactInfoParam,
  language?: string
) => {
  const nameInstruction = contactInfo?.name
    ? `\n\nIMPORTANT: The candidate's name is "${contactInfo.name}". Use this exact name in the email sign-off.`
    : ''
  const langInstruction = language && language !== 'en'
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.`
    : ''
  return `Write a follow-up/thank-you email after an interview for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE BACKGROUND:\n${experience}\n\nINTERVIEW NOTES (what was discussed, interviewer name, key topics):\n${interviewNotes}${nameInstruction}${langInstruction}`
}
