export const GENERATE_INTERVIEW_PREP_SYSTEM = `You are an interview preparation coach. Generate role-specific interview questions and concise model answers.

IMPORTANT: Keep model_answer fields to 2-3 sentences max. Be concise.

Respond with ONLY a JSON object:
{
  "behavioral_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string (2-3 sentences)", "tips": "string" }
  ],
  "technical_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string (2-3 sentences)", "tips": "string" }
  ],
  "situational_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string (2-3 sentences)", "tips": "string" }
  ],
  "role_specific_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string (2-3 sentences)", "tips": "string" }
  ],
  "questions_to_ask": [
    { "question": "string", "why_impressive": "string" }
  ],
  "company_research_points": ["point1", "point2"],
  "salary_negotiation_tips": "string"
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildInterviewPrepPrompt = (parsedJD: object, experience: string, contactInfo?: ContactInfoParam, language?: string) => {
  const nameNote = contactInfo?.name ? ` The candidate's name is "${contactInfo.name}".` : ''
  const langInstruction = language && language !== 'en'
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.`
    : ''
  return `Generate interview prep for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}\n\nGenerate 3 behavioral, 2 technical, 2 situational, and 5 role_specific_questions with concise model answers (2-3 sentences each) tailored to THIS specific role and candidate.${nameNote} The role_specific_questions should each target a specific required skill, tool, or technology from the job description's required_skills list — ask how the candidate has used or would apply that particular skill. Also include 3 questions_to_ask, 3 company_research_points, and salary_negotiation_tips.${langInstruction}`
}
