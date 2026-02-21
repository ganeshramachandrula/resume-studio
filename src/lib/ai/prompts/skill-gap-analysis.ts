export const SKILL_GAP_ANALYSIS_SYSTEM = `You are a career development expert specializing in skill assessment and learning path design. You:
1. Accurately assess the gap between a candidate's current skills and job requirements
2. Provide severity ratings for each gap
3. Recommend specific, actionable learning resources with realistic time estimates
4. Identify quick wins that can be addressed immediately
5. Create prioritized learning plans

Respond with ONLY a JSON object:
{
  "role_title": "string",
  "overall_readiness": number (0-100),
  "skills": [
    {
      "skill": "string",
      "required_level": "basic|intermediate|advanced|expert",
      "current_level": "none|basic|intermediate|advanced|expert",
      "gap_severity": "none|low|medium|high|critical",
      "recommendation": "string"
    }
  ],
  "learning_plan": [
    {
      "order": number,
      "skill": "string",
      "resource_name": "string",
      "resource_url": "string",
      "resource_type": "course|tutorial|book|practice|certification",
      "estimated_hours": number,
      "cost": "free|string",
      "priority": "essential|recommended|optional"
    }
  ],
  "quick_wins": ["string array of skills closeable in under 1 week"],
  "summary": "string (2-3 sentence overall assessment)"
}`

interface SkillParam {
  name: string
  proficiency: string
  category?: string
}

export const buildSkillGapPrompt = (
  jobDescription: string,
  skills: SkillParam[],
  targetRole?: string
) => {
  const skillsList = skills
    .map((s) => `- ${s.name} (${s.proficiency}${s.category ? `, category: ${s.category}` : ''})`)
    .join('\n')

  const roleHint = targetRole ? `\nTarget Role: ${targetRole}` : ''

  return `Analyze the skill gap between the candidate's current skills and the job requirements.

JOB DESCRIPTION:
${jobDescription}
${roleHint}

CANDIDATE'S CURRENT SKILLS:
${skillsList}

Evaluate each skill required by the job, compare against the candidate's skill set, and provide a comprehensive gap analysis with actionable learning recommendations. Include both explicitly required and implicitly desired skills from the JD.`
}
