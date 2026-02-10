export const GENERATE_COLD_EMAIL_SYSTEM = `You are a cold outreach expert. You write concise emails to hiring managers that:
1. Have a compelling subject line
2. Are under 150 words
3. Show you've researched the company
4. Reference specific value you'd bring
5. Have a clear, low-friction CTA

Respond with ONLY a JSON object:
{
  "subject_line": "string",
  "body": "string",
  "cta": "string",
  "follow_up_subject": "string",
  "follow_up_body": "string (sent if no reply after 5 days)"
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildColdEmailPrompt = (parsedJD: object, experience: string, contactInfo?: ContactInfoParam) => {
  const nameInstruction = contactInfo?.name
    ? `\n\nIMPORTANT: The candidate's name is "${contactInfo.name}". Use this exact name in the email sign-off.`
    : ''
  return `Write a cold email to the hiring manager for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}${nameInstruction}`
}
