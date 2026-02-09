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
  "questions_to_ask": [
    { "question": "string", "why_impressive": "string" }
  ],
  "company_research_points": ["point1", "point2"],
  "salary_negotiation_tips": "string"
}`

export const buildInterviewPrepPrompt = (parsedJD: object, experience: string) =>
  `Generate interview prep for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}\n\nGenerate 3 behavioral, 3 technical, 2 situational questions with concise model answers (2-3 sentences each) tailored to THIS specific role and candidate. Also include 3 questions_to_ask, 3 company_research_points, and salary_negotiation_tips.`
