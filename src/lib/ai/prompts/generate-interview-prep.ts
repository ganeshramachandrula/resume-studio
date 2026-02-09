export const GENERATE_INTERVIEW_PREP_SYSTEM = `You are an interview preparation coach. Generate role-specific interview questions and model answers.

Respond with ONLY a JSON object:
{
  "behavioral_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string", "tips": "string" }
  ],
  "technical_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string", "tips": "string" }
  ],
  "situational_questions": [
    { "question": "string", "why_asked": "string", "model_answer": "string", "tips": "string" }
  ],
  "questions_to_ask": [
    { "question": "string", "why_impressive": "string" }
  ],
  "company_research_points": ["point1", "point2"],
  "salary_negotiation_tips": "string"
}`

export const buildInterviewPrepPrompt = (parsedJD: object, experience: string) =>
  `Generate interview prep for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}\n\nGenerate 5 behavioral, 5 technical, 3 situational questions with model answers tailored to THIS specific role and candidate.`
