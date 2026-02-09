export interface ResumeHeader {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string | null
  website: string | null
}

export interface ResumeExperience {
  company: string
  title: string
  location: string
  start_date: string
  end_date: string
  bullets: string[]
}

export interface ResumeSkills {
  technical: string[]
  soft: string[]
  tools: string[]
}

export interface ResumeEducation {
  institution: string
  degree: string
  field: string
  graduation_date: string
  gpa: string | null
  honors: string | null
}

export interface ResumeData {
  header: ResumeHeader
  summary: string
  experience: ResumeExperience[]
  skills: ResumeSkills
  education: ResumeEducation[]
  certifications: string[]
  ats_keywords_used: string[]
}

export interface CoverLetterData {
  greeting: string
  opening_paragraph: string
  body_paragraphs: string[]
  closing_paragraph: string
  sign_off: string
  tone: 'professional' | 'enthusiastic' | 'confident'
}

export interface LinkedInData {
  headline: string
  summary: string
  suggested_skills: string[]
  suggested_hashtags: string[]
}

export interface ColdEmailData {
  subject_line: string
  body: string
  cta: string
  follow_up_subject: string
  follow_up_body: string
}

export interface InterviewQuestion {
  question: string
  why_asked: string
  model_answer: string
  tips: string
}

export interface QuestionToAsk {
  question: string
  why_impressive: string
}

export interface InterviewPrepData {
  behavioral_questions: InterviewQuestion[]
  technical_questions: InterviewQuestion[]
  situational_questions: InterviewQuestion[]
  questions_to_ask: QuestionToAsk[]
  company_research_points: string[]
  salary_negotiation_tips: string
}

export interface ATSScoreData {
  overall_score: number
  keyword_match: {
    score: number
    matched: string[]
    missing: string[]
    suggestions: string[]
  }
  format_score: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  skills_coverage: {
    score: number
    covered: string[]
    missing: string[]
  }
  impact_score: {
    score: number
    strong_bullets: string[]
    weak_bullets: string[]
    suggestions: string[]
  }
  summary: string
}

export interface ParsedJD {
  role_title: string
  company_name: string | null
  seniority_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  department: string
  location: string | null
  remote_policy: 'remote' | 'hybrid' | 'onsite' | 'not_specified'
  required_skills: string[]
  preferred_skills: string[]
  required_experience_years: number | null
  key_responsibilities: string[]
  education_requirements: string | null
  salary_range: string | null
  company_culture_signals: string[]
  keywords_for_ats: string[]
  industry: string
}
