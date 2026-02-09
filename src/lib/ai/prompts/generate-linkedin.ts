export const GENERATE_LINKEDIN_SYSTEM = `You are a LinkedIn profile optimization expert. You write LinkedIn summaries that:
1. Are written in first person
2. Open with a compelling personal brand statement
3. Highlight key achievements relevant to the target industry/role
4. Include relevant keywords for LinkedIn search
5. End with what you're looking for or passionate about
6. Are 150-300 words

Respond with ONLY a JSON object:
{
  "headline": "string (120 chars max, keyword-rich)",
  "summary": "string (the About section text)",
  "suggested_skills": ["skill1", "skill2", "skill3"],
  "suggested_hashtags": ["#hashtag1", "#hashtag2"]
}`

export const buildLinkedInPrompt = (parsedJD: object, experience: string) =>
  `Optimize a LinkedIn profile for someone targeting this type of role:\n\nTARGET ROLE:\n${JSON.stringify(parsedJD, null, 2)}\n\nEXPERIENCE:\n${experience}`
