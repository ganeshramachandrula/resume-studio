import type { ParsedJD, ResumeData, CoverLetterData, LinkedInData, ColdEmailData, InterviewPrepData, ATSScoreData } from '@/types/documents'

export const mockParsedJD: ParsedJD = {
  role_title: 'Senior Full-Stack Engineer',
  company_name: 'TechCorp Inc.',
  seniority_level: 'senior',
  department: 'Engineering',
  location: 'San Francisco, CA',
  remote_policy: 'hybrid',
  required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker'],
  preferred_skills: ['Next.js', 'Kubernetes', 'Redis', 'Terraform'],
  required_experience_years: 5,
  key_responsibilities: [
    'Design and build scalable web applications using React and Node.js',
    'Lead technical architecture decisions for new product features',
    'Mentor junior engineers and conduct code reviews',
    'Collaborate with product and design teams to deliver high-quality user experiences',
    'Optimize application performance and reliability',
  ],
  education_requirements: "Bachelor's in Computer Science or equivalent experience",
  salary_range: '$150,000 - $200,000',
  company_culture_signals: ['Fast-paced startup', 'Collaborative environment', 'Innovation-driven'],
  keywords_for_ats: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'microservices', 'CI/CD', 'agile', 'REST API', 'GraphQL', 'Docker', 'scalable architecture'],
  industry: 'Technology / SaaS',
}

export const mockResumeData: ResumeData = {
  header: {
    name: 'Alex Johnson',
    title: 'Senior Full-Stack Engineer',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    website: 'alexjohnson.dev',
  },
  summary: 'Results-driven Senior Full-Stack Engineer with 6+ years of experience building scalable web applications using React, TypeScript, and Node.js. Proven track record of leading technical architecture decisions, mentoring engineering teams, and delivering high-performance solutions that serve 500K+ users. Passionate about clean code, modern development practices, and creating exceptional user experiences.',
  experience: [
    {
      company: 'CloudScale Technologies',
      title: 'Senior Full-Stack Engineer',
      location: 'San Francisco, CA',
      start_date: '2022',
      end_date: 'Present',
      bullets: [
        'Architected and built a real-time analytics dashboard using React, TypeScript, and GraphQL, reducing customer reporting time by 75%',
        'Led migration from monolithic architecture to microservices on AWS, improving system reliability to 99.97% uptime',
        'Mentored team of 4 junior engineers through code reviews and pair programming, resulting in 40% faster feature delivery',
        'Optimized PostgreSQL queries and implemented Redis caching layer, reducing API response times by 60%',
      ],
    },
    {
      company: 'DataFlow Systems',
      title: 'Full-Stack Developer',
      location: 'Oakland, CA',
      start_date: '2019',
      end_date: '2022',
      bullets: [
        'Built and maintained customer-facing web applications using React and Node.js, serving 200K+ monthly active users',
        'Implemented CI/CD pipelines with Docker and GitHub Actions, reducing deployment time from 2 hours to 15 minutes',
        'Designed RESTful APIs and GraphQL endpoints that powered mobile and web clients simultaneously',
        'Collaborated with product team in agile sprints to deliver 12 major features over 18 months',
      ],
    },
    {
      company: 'WebStart Inc.',
      title: 'Junior Developer',
      location: 'San Jose, CA',
      start_date: '2018',
      end_date: '2019',
      bullets: [
        'Developed responsive front-end components using React and TypeScript for e-commerce platform',
        'Wrote comprehensive unit and integration tests achieving 90%+ code coverage',
        'Contributed to open-source component library used by 5,000+ developers',
      ],
    },
  ],
  skills: {
    technical: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker', 'Next.js', 'Python'],
    soft: ['Technical Leadership', 'Mentoring', 'Cross-functional Collaboration', 'Agile/Scrum'],
    tools: ['Git', 'GitHub Actions', 'Jira', 'Figma', 'VS Code', 'Datadog', 'Terraform'],
  },
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduation_date: '2018',
      gpa: '3.7',
      honors: 'Magna Cum Laude',
    },
  ],
  certifications: ['AWS Solutions Architect Associate', 'Google Cloud Professional Developer'],
  ats_keywords_used: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker', 'microservices', 'CI/CD', 'agile', 'REST API', 'scalable architecture'],
}

export const mockCoverLetterData: CoverLetterData = {
  greeting: 'Dear Hiring Manager,',
  opening_paragraph: "I'm writing to express my strong interest in the Senior Full-Stack Engineer position at TechCorp Inc. With over 6 years of experience building scalable web applications using React, TypeScript, and Node.js — the exact stack your team relies on — I'm excited about the opportunity to contribute to TechCorp's engineering excellence.",
  body_paragraphs: [
    "In my current role at CloudScale Technologies, I've led the architectural transition from a monolithic system to microservices on AWS, achieving 99.97% uptime while serving 500K+ users. This experience directly aligns with TechCorp's need for engineers who can design and build scalable applications. I've also implemented GraphQL APIs and PostgreSQL optimizations that reduced response times by 60%, demonstrating my commitment to performance-driven development.",
    "Beyond technical execution, I'm passionate about team growth and collaboration. I've mentored 4 junior engineers through structured code reviews and pair programming sessions, resulting in 40% faster feature delivery across our team. I thrive in cross-functional environments and have successfully partnered with product and design teams to ship 12 major features in agile sprints.",
    "What excites me most about TechCorp is your innovation-driven culture and the opportunity to work on products that make a real impact. I'm eager to bring my experience in modern web technologies, technical leadership, and scalable architecture to help drive your engineering vision forward.",
  ],
  closing_paragraph: "I'd welcome the chance to discuss how my background in full-stack development and technical leadership can contribute to TechCorp's continued success. Thank you for considering my application — I look forward to the possibility of joining your team.",
  sign_off: 'Best regards,\nAlex Johnson',
  tone: 'confident',
}

export const mockLinkedInData: LinkedInData = {
  headline: 'Senior Full-Stack Engineer | React & TypeScript | Building Scalable Web Applications',
  summary: "I build web applications that scale. With 6+ years of experience across the full stack — from React/TypeScript frontends to Node.js/PostgreSQL backends — I've helped companies serve hundreds of thousands of users with fast, reliable software.\n\nCurrently at CloudScale Technologies, I led our migration to microservices on AWS (99.97% uptime) and architected a real-time analytics dashboard that cut customer reporting time by 75%. I'm passionate about clean code, performance optimization, and mentoring the next generation of engineers.\n\nWhat drives me: solving complex technical challenges, shipping products that users love, and building engineering cultures where teams do their best work.\n\nOpen to connecting with fellow engineers, product leaders, and anyone building interesting things in tech.",
  suggested_skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Amazon Web Services (AWS)', 'GraphQL', 'Docker', 'System Design', 'Technical Leadership'],
  suggested_hashtags: ['#FullStackDeveloper', '#React', '#TypeScript', '#WebDevelopment', '#SoftwareEngineering'],
}

export const mockColdEmailData: ColdEmailData = {
  subject_line: "Senior Full-Stack Engineer interested in TechCorp's mission",
  body: "Hi [Hiring Manager],\n\nI came across TechCorp's Senior Full-Stack Engineer opening and was immediately drawn to your team's focus on building scalable, innovation-driven products.\n\nI'm a Senior Full-Stack Engineer with 6+ years of experience in React, TypeScript, and Node.js — your exact tech stack. At CloudScale Technologies, I recently led a microservices migration on AWS that achieved 99.97% uptime and built a real-time analytics dashboard that reduced customer reporting time by 75%.\n\nI'd love to learn more about the technical challenges your team is tackling and share how my experience could contribute.\n\nWould you be open to a brief 15-minute chat this week?",
  cta: 'Would you be open to a brief 15-minute chat this week?',
  follow_up_subject: 'Following up: Full-Stack Engineer opportunity at TechCorp',
  follow_up_body: "Hi [Hiring Manager],\n\nI wanted to follow up on my previous note about the Senior Full-Stack Engineer role. I understand you're busy, and I respect your time.\n\nSince my last message, I've been exploring TechCorp's recent product launches and I'm even more excited about the technical challenges your team is solving. My experience with scalable architecture and real-time systems feels like a strong fit.\n\nI'd welcome even a quick chat to explore whether there's a mutual fit. Happy to work around your schedule.\n\nBest,\nAlex Johnson",
}

export const mockInterviewPrepData: InterviewPrepData = {
  behavioral_questions: [
    {
      question: 'Tell me about a time you led a major technical migration or architectural change.',
      why_asked: "TechCorp needs engineers who can lead architecture decisions. They want to assess your ability to plan, execute, and manage risk during large-scale changes.",
      model_answer: "At CloudScale Technologies, I led our migration from a monolithic Node.js application to microservices on AWS. I started by mapping all service dependencies and creating a phased migration plan. We used the strangler fig pattern to gradually extract services while maintaining the existing system. I coordinated with 3 teams, set up comprehensive monitoring, and established rollback procedures. The migration took 6 months and resulted in 99.97% uptime — actually better than our monolith. The key was thorough planning and never cutting corners on testing.",
      tips: 'Use the STAR method. Emphasize planning, risk mitigation, and measurable outcomes. Show leadership beyond just coding.',
    },
    {
      question: 'Describe a time you mentored a junior engineer who was struggling.',
      why_asked: "The role involves mentoring. They want to see empathy, patience, and concrete strategies for helping others grow.",
      model_answer: "I noticed a junior developer on my team was struggling with React state management and consistently producing buggy code. Instead of just fixing their PRs, I set up weekly 1-on-1 pair programming sessions focused on the concepts they found challenging. I also created a small internal workshop on React patterns. Within 2 months, their PR approval rate went from 40% first-try to 85%, and they eventually became the team's go-to person for React questions.",
      tips: "Show that you invest in people, not just code. Quantify the improvement and show it benefited the whole team.",
    },
    {
      question: 'How do you handle disagreements about technical approaches with your team?',
      why_asked: "In a collaborative environment, conflicts happen. They want to see maturity, data-driven decision making, and respect for others' perspectives.",
      model_answer: "I had a disagreement with a colleague about whether to use GraphQL or REST for a new API. Rather than debating opinions, I suggested we each build a small proof-of-concept and evaluate against our actual requirements: query complexity, client needs, and team expertise. After comparing both, the data clearly showed GraphQL was the better fit for our use case. My colleague appreciated the approach because the decision was based on evidence, not hierarchy.",
      tips: "Emphasize objectivity and collaboration. Show you care about the best outcome, not being right.",
    },
  ],
  technical_questions: [
    {
      question: 'How would you design a real-time notification system that scales to millions of users?',
      why_asked: "Tests system design thinking, knowledge of real-time technologies, and scalability considerations.",
      model_answer: "I'd use a pub/sub architecture with WebSocket connections for real-time delivery. The backend would have a notification service that publishes events to Redis Pub/Sub or AWS SNS. For WebSocket management at scale, I'd use a service like AWS API Gateway WebSocket or a cluster of Socket.io servers behind a load balancer with Redis adapter for cross-server communication. Notifications would be persisted in PostgreSQL with a read/unread status. For offline users, I'd queue notifications and deliver them on reconnection. I'd also implement exponential backoff for reconnection and use connection pooling to manage resources.",
      tips: "Start with requirements, draw the architecture, then dive into specifics. Mention trade-offs and how you'd handle failure cases.",
    },
    {
      question: 'Explain how you would optimize a slow PostgreSQL query that joins 4 tables.',
      why_asked: "Database optimization is critical for the role. They want to see practical debugging and optimization skills.",
      model_answer: "First, I'd run EXPLAIN ANALYZE to understand the query plan and identify bottlenecks — looking for sequential scans, high row estimates, and missing indexes. Common optimizations include: adding composite indexes on frequently joined/filtered columns, rewriting subqueries as JOINs or CTEs, ensuring statistics are up to date with ANALYZE, and considering partial indexes for filtered queries. If the query is still slow, I'd evaluate materialized views for frequently accessed aggregations, or denormalization if the join pattern is consistent and read-heavy.",
      tips: "Always start with EXPLAIN ANALYZE. Show a systematic approach rather than guessing at optimizations.",
    },
  ],
  situational_questions: [
    {
      question: 'Your team has a tight deadline and you discover a significant security vulnerability. What do you do?',
      why_asked: "Tests prioritization, risk assessment, and communication skills under pressure.",
      model_answer: "Security vulnerabilities cannot wait. I'd immediately assess the severity — is it exploitable now, and what data is at risk? I'd communicate the finding to my tech lead and security team right away with a clear assessment. For a critical vulnerability, I'd propose pausing the feature work to fix it, explaining the business risk. I'd also suggest we could potentially parallelize: one person fixes the vulnerability while others continue on the feature. After fixing it, I'd advocate for a brief post-mortem to prevent similar issues and suggest adding security checks to our CI/CD pipeline.",
      tips: "Always prioritize security. Show you can communicate risk clearly to stakeholders and propose practical solutions.",
    },
  ],
  questions_to_ask: [
    {
      question: "What does the technical architecture look like today, and what are the biggest engineering challenges you're facing?",
      why_impressive: "Shows genuine interest in the technical landscape and positions you as someone who thinks about solving real problems.",
    },
    {
      question: 'How does the engineering team balance shipping new features with paying down technical debt?',
      why_impressive: "Demonstrates maturity and awareness that sustainable engineering requires investment in both.",
    },
    {
      question: "What does the mentoring and growth path look like for senior engineers here?",
      why_impressive: "Shows you're thinking long-term about your career at TechCorp and care about continuous growth.",
    },
  ],
  company_research_points: [
    "TechCorp is a fast-growing SaaS company in the technology sector with a focus on innovation",
    "They use a modern tech stack (React, TypeScript, Node.js, AWS) indicating engineering-first culture",
    "The hybrid work policy suggests flexibility while valuing in-person collaboration",
    "Competitive salary range ($150K-$200K) indicates they invest in top talent",
  ],
  salary_negotiation_tips: "With 6+ years of experience and the senior-level skills they're seeking, you're well-positioned to negotiate toward the upper end of the $150K-$200K range. Highlight your specific achievements (99.97% uptime, 75% reduction in reporting time) as concrete evidence of your value. Consider negotiating beyond base salary — equity, signing bonus, professional development budget, and flexible work arrangements are all on the table. Research market rates on levels.fyi and Glassdoor to support your ask with data.",
}

export const mockATSScoreData: ATSScoreData = {
  overall_score: 87,
  keyword_match: {
    score: 92,
    matched: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker', 'CI/CD', 'agile', 'REST API'],
    missing: ['Kubernetes', 'Terraform'],
    suggestions: [
      'Add Kubernetes experience if applicable — even personal projects count',
      'Mention Terraform or infrastructure-as-code experience in your skills section',
    ],
  },
  format_score: {
    score: 95,
    issues: ['Consider adding a dedicated "Projects" section for additional keyword coverage'],
    suggestions: ['Resume format is clean and ATS-friendly', 'Section headers are standard and parseable'],
  },
  skills_coverage: {
    score: 88,
    covered: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker', 'Next.js'],
    missing: ['Kubernetes', 'Redis', 'Terraform'],
  },
  impact_score: {
    score: 82,
    strong_bullets: [
      'Reduced customer reporting time by 75%',
      'Improved system reliability to 99.97% uptime',
      'Reduced API response times by 60%',
    ],
    weak_bullets: [
      'Contributed to open-source component library — quantify impact (downloads, contributors)',
    ],
    suggestions: [
      'Add specific metrics to your WebStart Inc. experience bullets',
      'Quantify the scale of applications you built (users, requests/sec, data volume)',
    ],
  },
  summary: 'Strong resume with excellent keyword coverage and quantified achievements. To boost your score further, add experience with Kubernetes and Terraform (mentioned in preferred skills), and quantify remaining bullets. Your resume is well-formatted for ATS parsing.',
}
