export const GENERATE_CERTIFICATION_GUIDE_SYSTEM = `You are a career certification advisor. Recommend the most relevant professional certifications for a target role, ranked by impact.

IMPORTANT: Be specific about costs, durations, and platforms. Use current market data.

Respond with ONLY a JSON object:
{
  "role_title": "string",
  "certifications": [
    {
      "name": "string",
      "issuing_body": "string",
      "priority": "must_have" | "strongly_recommended" | "nice_to_have",
      "estimated_cost": "string (e.g. '$300')",
      "duration": "string (e.g. '2-3 months')",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "platform": "string (e.g. 'Coursera, official website')",
      "url": "string (enrollment or info URL)",
      "why_it_helps": "string (2-3 sentences, specific to this role)",
      "salary_impact": "string (e.g. '+12% avg salary increase')"
    }
  ],
  "learning_path": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "industry_insights": "string (2-3 sentences on how certifications impact hiring/salary in this field)",
  "summary": "string (1-2 sentence overview)"
}`

interface ContactInfoParam {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
}

export const buildCertificationGuidePrompt = (parsedJD: object, experience: string, contactInfo?: ContactInfoParam, language?: string) => {
  const nameNote = contactInfo?.name ? ` The candidate's name is "${contactInfo.name}".` : ''
  const langInstruction = language && language !== 'en'
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${language}. Every piece of text in your response must be in ${language}. JSON keys remain in English, but all string values must be in ${language}.`
    : ''
  return `Generate a certification guide for:\n\nROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nCANDIDATE:\n${experience}\n\nRecommend 5-8 certifications ranked by relevance to THIS specific role and candidate background.${nameNote} Group them into priority tiers: must_have (1-2), strongly_recommended (2-3), and nice_to_have (2-3). Include realistic cost estimates, study durations, difficulty levels, and specific enrollment platforms/URLs. Explain concretely how each certification helps for this exact role. Provide a suggested learning path (ordered steps) and industry insights on how certifications impact hiring and salary in this field.${langInstruction}`
}
