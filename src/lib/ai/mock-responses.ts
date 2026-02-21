import type { ParsedJD, ResumeData, CoverLetterData, LinkedInData, ColdEmailData, InterviewPrepData, CertificationGuideData, ATSScoreData, CountryResumeData, RoastResult, FollowUpEmailData, SkillGapData } from '@/types/documents'

export const mockParsedJD: ParsedJD = {
  role_title: 'Marketing Manager',
  company_name: 'Brightwave Consumer Brands',
  seniority_level: 'mid',
  department: 'Marketing',
  location: 'Chicago, IL',
  remote_policy: 'hybrid',
  required_skills: ['Brand Management', 'Digital Marketing', 'SEO/SEM', 'Market Research', 'Campaign Management', 'Budget Management', 'Analytics'],
  preferred_skills: ['CRM Platforms', 'Content Strategy', 'Marketing Automation', 'A/B Testing'],
  required_experience_years: 5,
  key_responsibilities: [
    'Develop and execute integrated marketing campaigns across digital and traditional channels',
    'Manage annual marketing budget of $2M+ and optimize spend for maximum ROI',
    'Lead market research initiatives to identify consumer trends and competitive opportunities',
    'Collaborate with sales, product, and creative teams to align messaging and drive revenue',
    'Track and report on campaign performance using analytics tools and KPIs',
  ],
  education_requirements: "Bachelor's in Marketing, Business, or related field",
  salary_range: '$90,000 - $120,000',
  company_culture_signals: ['Growth-oriented', 'Data-driven', 'Collaborative team culture'],
  keywords_for_ats: ['brand management', 'digital marketing', 'SEO', 'SEM', 'market research', 'campaign management', 'budget management', 'analytics', 'CRM', 'content strategy', 'ROI', 'cross-functional'],
  industry: 'Consumer Goods',
}

export const mockResumeData: ResumeData = {
  header: {
    name: 'Jordan Rivera',
    title: 'Marketing Manager',
    email: 'jordan.rivera@email.com',
    phone: '(555) 234-5678',
    location: 'Chicago, IL',
    linkedin: 'linkedin.com/in/jordanrivera',
    website: null,
  },
  summary: 'Results-driven Marketing Manager with 6+ years of experience leading integrated campaigns across digital and traditional channels for consumer brands. Proven track record of growing brand awareness by 40%, managing $2M+ budgets, and delivering measurable ROI through data-driven strategy. Skilled at cross-functional collaboration, market research, and translating consumer insights into compelling brand stories.',
  experience: [
    {
      company: 'Crestline Consumer Products',
      title: 'Marketing Manager',
      location: 'Chicago, IL',
      start_date: '2022',
      end_date: 'Present',
      bullets: [
        'Led rebranding initiative for flagship product line, increasing brand awareness by 40% and driving $3.2M in incremental revenue within 12 months',
        'Managed $2.1M annual marketing budget across digital, print, and event channels, achieving 28% improvement in cost-per-acquisition',
        'Designed and executed SEO/SEM strategy that increased organic traffic by 65% and reduced paid search spend by 20%',
        'Partnered with sales and product teams to launch 4 new products, exceeding first-year revenue targets by 15%',
      ],
    },
    {
      company: 'Meridian Brands Group',
      title: 'Senior Marketing Coordinator',
      location: 'Milwaukee, WI',
      start_date: '2019',
      end_date: '2022',
      bullets: [
        'Planned and executed 12+ multichannel campaigns per year, generating 35% increase in qualified leads',
        'Conducted market research and competitive analysis that informed pricing strategy, contributing to 18% revenue growth',
        'Managed CRM platform (HubSpot) and marketing automation workflows, improving email open rates by 22%',
        'Coordinated with external agencies on creative production, ensuring brand consistency across 50+ assets per quarter',
      ],
    },
    {
      company: 'Greenleaf Marketing Agency',
      title: 'Marketing Associate',
      location: 'Madison, WI',
      start_date: '2018',
      end_date: '2019',
      bullets: [
        'Supported campaign execution for 8 consumer brand clients across food, retail, and wellness sectors',
        'Created monthly analytics reports tracking KPIs including engagement, conversion, and ROI for client presentations',
        'Managed social media content calendars and grew combined client followings by 25%',
      ],
    },
  ],
  skills: {
    core: ['Brand Management', 'Digital Marketing', 'SEO/SEM', 'Market Research', 'Campaign Strategy', 'Budget Management', 'Content Strategy', 'A/B Testing'],
    interpersonal: ['Cross-functional Leadership', 'Team Mentoring', 'Stakeholder Communication', 'Vendor Management'],
    tools: ['HubSpot', 'Google Analytics', 'Salesforce', 'Hootsuite', 'Canva', 'Tableau', 'Mailchimp'],
  },
  education: [
    {
      institution: 'University of Wisconsin-Madison',
      degree: 'Bachelor of Business Administration',
      field: 'Marketing',
      graduation_date: '2018',
      gpa: '3.6',
      honors: 'Dean\'s List',
    },
  ],
  certifications: ['Google Analytics Certified', 'HubSpot Inbound Marketing Certified'],
  ats_keywords_used: ['brand management', 'digital marketing', 'SEO', 'SEM', 'market research', 'campaign management', 'budget management', 'analytics', 'CRM', 'content strategy', 'ROI', 'cross-functional'],
}

export const mockCoverLetterData: CoverLetterData = {
  greeting: 'Dear Hiring Manager,',
  opening_paragraph: "I'm writing to express my strong interest in the Marketing Manager position at Brightwave Consumer Brands. With over 6 years of experience leading integrated marketing campaigns and managing multimillion-dollar budgets for consumer brands, I'm excited about the opportunity to help Brightwave accelerate its growth and strengthen its market position.",
  body_paragraphs: [
    "In my current role at Crestline Consumer Products, I led a rebranding initiative that increased brand awareness by 40% and drove $3.2M in incremental revenue. I manage a $2.1M annual budget across digital, print, and event channels, consistently improving cost-per-acquisition. My SEO/SEM strategy alone increased organic traffic by 65% while reducing paid search spend by 20% — demonstrating my commitment to maximizing ROI on every marketing dollar.",
    "Beyond campaign execution, I thrive on cross-functional collaboration and data-driven decision making. I've partnered closely with sales and product teams to launch 4 new products that exceeded revenue targets, and I've used market research to inform pricing strategies that contributed to 18% revenue growth. I believe great marketing starts with deep consumer understanding and translates into measurable business results.",
    "What excites me most about Brightwave is your growth-oriented culture and focus on building brands that resonate with consumers. I'm eager to bring my experience in brand management, analytics, and team leadership to help drive your next chapter of growth.",
  ],
  closing_paragraph: "I'd welcome the chance to discuss how my background in consumer brand marketing and data-driven strategy can contribute to Brightwave's continued success. Thank you for considering my application — I look forward to the possibility of joining your team.",
  sign_off: 'Best regards,\nJordan Rivera',
  tone: 'confident',
}

export const mockLinkedInData: LinkedInData = {
  headline: 'Marketing Manager | Brand Strategy & Digital Campaigns | Driving Measurable Growth for Consumer Brands',
  summary: "I help consumer brands grow. With 6+ years of experience spanning brand management, digital marketing, and campaign strategy, I've led initiatives that increased brand awareness by 40%, drove millions in revenue, and consistently delivered strong ROI.\n\nCurrently at Crestline Consumer Products, I manage a $2M+ marketing budget and lead cross-functional teams to launch products that exceed revenue targets. I'm passionate about turning consumer insights into compelling brand stories and using data to optimize every touchpoint in the customer journey.\n\nWhat drives me: building brands people love, finding the story in the data, and collaborating with talented teams to deliver results that matter.\n\nAlways happy to connect with fellow marketers, brand strategists, and anyone passionate about consumer brands.",
  suggested_skills: ['Brand Management', 'Digital Marketing', 'SEO/SEM', 'Market Research', 'Campaign Management', 'Budget Management', 'Google Analytics', 'HubSpot', 'Cross-functional Leadership'],
  suggested_hashtags: ['#Marketing', '#BrandStrategy', '#DigitalMarketing', '#ConsumerBrands', '#MarketingLeadership'],
}

export const mockColdEmailData: ColdEmailData = {
  subject_line: "Marketing Manager interested in Brightwave's brand vision",
  body: "Hi [Hiring Manager],\n\nI came across Brightwave's Marketing Manager opening and was immediately drawn to your team's focus on building consumer brands that stand out in competitive markets.\n\nI'm a Marketing Manager with 6+ years of experience in brand strategy, digital campaigns, and budget management. At Crestline Consumer Products, I recently led a rebranding initiative that increased brand awareness by 40% and drove $3.2M in incremental revenue — while improving our cost-per-acquisition by 28%.\n\nI'd love to learn more about Brightwave's growth plans and share how my experience in consumer brand marketing could contribute.\n\nWould you be open to a brief 15-minute chat this week?",
  cta: 'Would you be open to a brief 15-minute chat this week?',
  follow_up_subject: 'Following up: Marketing Manager opportunity at Brightwave',
  follow_up_body: "Hi [Hiring Manager],\n\nI wanted to follow up on my previous note about the Marketing Manager role. I understand you're busy, and I respect your time.\n\nSince my last message, I've been following Brightwave's recent product launches and I'm even more impressed by your brand positioning in the market. My experience managing $2M+ budgets and launching products that exceed revenue targets feels like a strong fit for your growth goals.\n\nI'd welcome even a quick chat to explore whether there's a mutual fit. Happy to work around your schedule.\n\nBest,\nJordan Rivera",
}

export const mockInterviewPrepData: InterviewPrepData = {
  behavioral_questions: [
    {
      question: 'Tell me about a time you launched a major campaign that didn\'t go as planned. How did you handle it?',
      why_asked: "Brightwave wants marketers who can adapt under pressure. They want to assess your ability to troubleshoot, pivot, and still deliver results when things go wrong.",
      model_answer: "We launched a holiday campaign at Crestline that underperformed in its first week — click-through rates were 40% below projections. Instead of panicking, I pulled the analytics and discovered our messaging wasn't resonating with our core 25-34 demographic. I worked with the creative team to A/B test three new ad variations over the weekend. By Tuesday, we had a winning creative that outperformed the original by 60%. The campaign ended up exceeding its revenue target by 12%. The key lesson was the importance of building flexibility into campaign timelines so you have room to optimize.",
      tips: 'Use the STAR method. Show you stayed calm, used data to diagnose the problem, and turned the situation around with measurable results.',
    },
    {
      question: 'Describe a time you had to align multiple teams around a single marketing initiative.',
      why_asked: "The role requires cross-functional collaboration with sales, product, and creative teams. They want to see leadership, communication, and influence skills.",
      model_answer: "When launching a new product line at Crestline, I needed to align sales, product, creative, and our external PR agency around a unified go-to-market strategy. I organized a kickoff workshop where each team shared their priorities and constraints. From there, I created a shared campaign brief and timeline with clear milestones and owners. I held weekly syncs and used a shared dashboard so everyone could see progress. The product launch exceeded first-year revenue targets by 15%, and our VP of Sales credited the marketing alignment as a key factor.",
      tips: "Emphasize how you brought people together, created clarity, and drove accountability. Show the business impact of good collaboration.",
    },
    {
      question: 'How do you prioritize when you have multiple campaigns running simultaneously with limited budget?',
      why_asked: "Budget management is a core requirement. They want to see strategic thinking and the ability to make trade-offs based on data.",
      model_answer: "I use a scoring framework based on three factors: expected ROI, strategic alignment with business goals, and time sensitivity. At Crestline, I had to allocate budget across a product launch, a brand awareness campaign, and a seasonal promotion all in Q4. I pulled historical data on each channel's performance and modeled different allocation scenarios. I ended up shifting 30% of the brand awareness budget to the product launch because the data showed a higher short-term ROI, while maintaining brand spend on our highest-performing organic channels. All three campaigns hit their targets.",
      tips: "Show a clear decision-making framework. Demonstrate that you use data, not gut feeling, to make allocation decisions.",
    },
  ],
  technical_questions: [
    {
      question: 'How would you develop a strategy to enter a new market segment for one of our product lines?',
      why_asked: "Tests strategic marketing thinking, market research skills, and the ability to build a go-to-market plan from scratch.",
      model_answer: "I'd start with thorough market research — analyzing the target segment's size, demographics, buying behavior, and competitive landscape. I'd conduct consumer surveys or focus groups to understand pain points and unmet needs. From there, I'd define our positioning and value proposition for this segment, ensuring it's differentiated from competitors. I'd build a phased go-to-market plan: first a small pilot campaign in a test market to validate messaging and channels, then scale based on results. I'd set clear KPIs (awareness, trial, conversion, retention) and build in checkpoints to evaluate progress and adjust strategy.",
      tips: "Start with research, show a structured approach, and emphasize testing before scaling. Mention how you'd measure success at each stage.",
    },
    {
      question: 'Walk me through how you measure the ROI of a multi-channel marketing campaign.',
      why_asked: "Analytics and measurement are essential for the role. They want to see practical skills in attribution, KPI tracking, and reporting.",
      model_answer: "I use a multi-touch attribution model combined with channel-specific KPIs. First, I establish clear campaign objectives and assign measurable KPIs to each channel — for example, impressions and reach for awareness channels, click-through rate and cost-per-click for paid media, and conversion rate and revenue for bottom-funnel activities. I use UTM parameters and analytics tools like Google Analytics to track the customer journey across touchpoints. For overall ROI, I calculate total campaign revenue against total spend, including creative production and agency fees. I also track leading indicators weekly so I can optimize spend in real time rather than waiting for post-campaign analysis.",
      tips: "Be specific about the tools and metrics you use. Show that you understand both leading and lagging indicators.",
    },
  ],
  role_specific_questions: [
    {
      question: 'Describe your approach to developing and executing an SEO/SEM strategy. How do you balance organic and paid search?',
      why_asked: "SEO/SEM is a required skill for this role. They want to assess hands-on experience with search marketing and strategic allocation.",
      model_answer: "I treat SEO and SEM as complementary channels. I prioritize SEO for long-term growth — conducting keyword research, optimizing on-page content, and building authority through quality backlinks. For SEM, I use paid search to capture high-intent traffic and fill gaps where organic rankings are still building. I allocate budget based on data: if organic is strong for a keyword cluster, I reduce paid spend there and redirect it to competitive terms.",
      tips: "Show you understand both disciplines and can make data-driven decisions about budget allocation between them.",
    },
    {
      question: 'How do you approach managing a $2M+ marketing budget? Walk me through your planning and tracking process.',
      why_asked: "Budget management is a core requirement. They need someone who can allocate resources strategically and track ROI.",
      model_answer: "I start with annual planning by aligning budget to business goals, then break it into quarterly allocations by channel. I use a zero-based budgeting approach where every dollar needs a projected return. I track spend weekly against plan using a shared dashboard and hold monthly reviews with finance to flag variances early and reallocate underperforming spend.",
      tips: "Emphasize your planning rigor and proactive tracking. Mention specific tools or frameworks you use for budget management.",
    },
    {
      question: 'Tell me about a market research initiative you led. How did you translate findings into actionable marketing strategy?',
      why_asked: "Market research is listed as a required skill. They want to see you can go from data collection to strategic recommendations.",
      model_answer: "At Crestline, I led a consumer segmentation study combining quantitative surveys with qualitative focus groups. The research revealed an underserved 25-34 demographic that valued sustainability. I translated this into a targeted campaign with eco-friendly messaging that increased engagement in that segment by 45% and informed our product team's packaging redesign.",
      tips: "Show the full arc from research methodology to insight to action to measurable result.",
    },
    {
      question: 'How have you used CRM platforms to improve marketing effectiveness? Give a specific example.',
      why_asked: "CRM is a preferred skill. They want to assess whether you can leverage customer data for better targeting and personalization.",
      model_answer: "At Meridian, I managed our HubSpot CRM and built automated nurture workflows based on lead scoring. I segmented our database by engagement level and purchase history, then created personalized email sequences for each segment. This improved email open rates by 22% and increased marketing-qualified leads by 30%.",
      tips: "Name specific CRM platforms you've used and quantify the impact of your CRM-driven initiatives.",
    },
    {
      question: 'What analytics tools do you use to measure campaign performance, and how do you communicate results to stakeholders?',
      why_asked: "Analytics is a required skill. They want to see you're data-driven and can translate metrics into business insights for leadership.",
      model_answer: "I primarily use Google Analytics, Tableau for visualization, and platform-specific dashboards. For stakeholder reporting, I build weekly automated dashboards showing KPIs against targets and prepare monthly executive summaries that focus on business outcomes — revenue impact, cost efficiency, and strategic recommendations — rather than vanity metrics.",
      tips: "Show that you can translate raw data into business language. Mention how you tailor reporting to different audiences.",
    },
  ],
  situational_questions: [
    {
      question: 'A key product launch is next month and your primary agency just lost the creative director handling your account. What do you do?',
      why_asked: "Tests problem-solving, vendor management, and the ability to maintain quality under pressure.",
      model_answer: "First, I'd schedule a call with the agency leadership to understand their transition plan and who will be taking over. I'd assess whether the replacement has the context and capability to deliver on our timeline. In parallel, I'd pull together all existing creative briefs, brand guidelines, and approved concepts to minimize the ramp-up time. If I wasn't confident in the agency's ability to deliver, I'd activate a backup plan — either bringing in a freelance creative director I've worked with before, or shifting some of the work to our in-house team. Throughout, I'd keep my leadership informed and adjust the timeline if needed, because it's better to launch a week late with strong creative than on time with weak work.",
      tips: "Show proactive risk management. Demonstrate that you have contingency plans and prioritize quality over rigid timelines.",
    },
  ],
  questions_to_ask: [
    {
      question: "What are Brightwave's biggest growth priorities for the next 12 months, and how does the marketing team contribute to them?",
      why_impressive: "Shows you're thinking strategically about how marketing drives business results, not just campaigns in isolation.",
    },
    {
      question: 'How does the marketing team collaborate with sales and product teams on go-to-market strategy?',
      why_impressive: "Demonstrates you understand that great marketing requires cross-functional alignment and you value collaboration.",
    },
    {
      question: "What does success look like for someone in this role in the first 6 months?",
      why_impressive: "Shows you're focused on delivering results quickly and want to understand expectations upfront.",
    },
  ],
  company_research_points: [
    "Brightwave is a growth-oriented consumer brands company focused on building market-leading products",
    "They value data-driven decision making, suggesting a culture that rewards analytical marketers",
    "The hybrid work policy indicates flexibility while valuing in-person collaboration for creative work",
    "Competitive salary range ($90K-$120K) for a marketing manager role in Chicago",
  ],
  salary_negotiation_tips: "With 6+ years of experience and a strong track record of driving measurable results, you're well-positioned to negotiate toward the upper end of the $90K-$120K range. Highlight specific achievements like the 40% brand awareness increase and $3.2M revenue impact as concrete evidence of your value. Consider negotiating beyond base salary — performance bonuses, professional development budget, conference attendance, and flexible work arrangements are all on the table. Research market rates on Glassdoor and Payscale to support your ask with data.",
}

export const mockCertificationGuideData: CertificationGuideData = {
  role_title: 'Marketing Manager',
  certifications: [
    {
      name: 'Google Analytics Certification',
      issuing_body: 'Google',
      priority: 'must_have',
      estimated_cost: 'Free',
      duration: '2-4 weeks',
      difficulty: 'beginner',
      platform: 'Google Skillshop',
      url: 'https://skillshop.withgoogle.com/googleanalytics',
      why_it_helps: 'Analytics is a core requirement for this role. This certification proves you can track campaign performance, measure ROI, and make data-driven decisions — exactly what Brightwave needs from their Marketing Manager.',
      salary_impact: '+8% avg salary increase for analytics-certified marketers',
    },
    {
      name: 'HubSpot Inbound Marketing Certification',
      issuing_body: 'HubSpot Academy',
      priority: 'must_have',
      estimated_cost: 'Free',
      duration: '1-2 weeks',
      difficulty: 'beginner',
      platform: 'HubSpot Academy',
      url: 'https://academy.hubspot.com/courses/inbound-marketing',
      why_it_helps: 'CRM and marketing automation are preferred skills in this JD. Since HubSpot is already in your toolset, this certification validates your expertise and shows you can build the nurture workflows Brightwave needs to scale.',
      salary_impact: '+6% avg salary increase; highly valued in consumer brands',
    },
    {
      name: 'Meta Certified Marketing Science Professional',
      issuing_body: 'Meta',
      priority: 'strongly_recommended',
      estimated_cost: '$150',
      duration: '4-6 weeks',
      difficulty: 'intermediate',
      platform: 'Meta Blueprint',
      url: 'https://www.facebook.com/business/learn/certification',
      why_it_helps: 'Digital marketing is a core requirement, and social/paid media is central to consumer brand marketing. This certification demonstrates advanced skills in campaign measurement and attribution across Meta platforms.',
      salary_impact: '+10% avg salary increase for certified digital marketers',
    },
    {
      name: 'Google Ads Certification',
      issuing_body: 'Google',
      priority: 'strongly_recommended',
      estimated_cost: 'Free',
      duration: '2-3 weeks',
      difficulty: 'intermediate',
      platform: 'Google Skillshop',
      url: 'https://skillshop.withgoogle.com/googleads',
      why_it_helps: 'SEM is explicitly required in this role. This certification proves you can manage paid search campaigns effectively — critical for optimizing the $2M+ budget Brightwave expects you to manage.',
      salary_impact: '+7% avg salary increase for SEM-certified professionals',
    },
    {
      name: 'Content Marketing Certification',
      issuing_body: 'HubSpot Academy',
      priority: 'strongly_recommended',
      estimated_cost: 'Free',
      duration: '1-2 weeks',
      difficulty: 'beginner',
      platform: 'HubSpot Academy',
      url: 'https://academy.hubspot.com/courses/content-marketing',
      why_it_helps: 'Content strategy is a preferred skill in the JD. This certification fills a gap in your profile and shows you can develop content strategies that drive organic growth — complementing your existing SEO skills.',
      salary_impact: '+5% avg salary increase; differentiator in consumer brand roles',
    },
    {
      name: 'Tableau Desktop Specialist',
      issuing_body: 'Tableau (Salesforce)',
      priority: 'nice_to_have',
      estimated_cost: '$250',
      duration: '4-6 weeks',
      difficulty: 'intermediate',
      platform: 'Tableau eLearning',
      url: 'https://www.tableau.com/learn/certification',
      why_it_helps: 'You already use Tableau, but certification validates your data visualization skills. Being able to build executive dashboards for campaign reporting strengthens your position as a data-driven marketing leader.',
      salary_impact: '+12% avg salary increase for Tableau-certified professionals',
    },
    {
      name: 'Project Management Professional (PMP)',
      issuing_body: 'Project Management Institute (PMI)',
      priority: 'nice_to_have',
      estimated_cost: '$555',
      duration: '3-6 months',
      difficulty: 'advanced',
      platform: 'PMI.org',
      url: 'https://www.pmi.org/certifications/project-management-pmp',
      why_it_helps: 'Managing $2M+ budgets and coordinating cross-functional teams are core requirements. PMP certification demonstrates your ability to lead complex marketing initiatives with structured project management methodology.',
      salary_impact: '+20% avg salary increase; highly valued for marketing leadership roles',
    },
  ],
  learning_path: [
    'Start with Google Analytics Certification (free, 2 weeks) — builds your data foundation',
    'Complete HubSpot Inbound Marketing Certification (free, 1-2 weeks) — validates CRM/automation skills',
    'Earn Google Ads Certification (free, 2-3 weeks) — strengthens your SEM credentials',
    'Pursue HubSpot Content Marketing Certification (free, 1-2 weeks) — fills the content strategy gap',
    'Take Meta Marketing Science Professional exam ($150, 4-6 weeks) — deepens digital marketing expertise',
    'Consider Tableau Desktop Specialist ($250, 4-6 weeks) — elevates data visualization capabilities',
    'When ready for leadership roles, pursue PMP ($555, 3-6 months) — demonstrates project management mastery',
  ],
  industry_insights: 'In consumer brand marketing, certifications in analytics and digital platforms are increasingly table stakes for mid-to-senior roles. Hiring managers report that certified candidates receive 15-20% more interview callbacks. For marketing managers, the combination of Google Analytics + a CRM certification (HubSpot or Salesforce) creates the strongest signal of data-driven marketing capability, which is the #1 skill gap employers are trying to fill.',
  summary: 'Focus first on the free certifications (Google Analytics, HubSpot, Google Ads) to strengthen your analytics and digital marketing credentials. These directly address the core requirements in the Brightwave JD and can be completed within 2 months.',
}

export const mockCoachResponse = `Great question! Here are some thoughts:

**Strategic Positioning**
When preparing for a career transition, the key is to reframe your existing experience in terms that resonate with your target role. Focus on transferable skills and quantifiable achievements that demonstrate your ability to deliver value.

**Action Steps**
- Update your resume to highlight cross-functional projects and leadership moments
- Identify 3-5 target companies and research their current challenges
- Reach out to 2-3 people in similar roles for informational interviews
- Practice your "career story" — a 2-minute narrative that connects your past to your desired future

The most successful career transitions I've seen happen when candidates lead with curiosity and demonstrate genuine passion for the new direction. What specific aspect of your transition would you like to explore further?`

export const mockATSScoreData: ATSScoreData = {
  overall_score: 87,
  keyword_match: {
    score: 92,
    matched: ['brand management', 'digital marketing', 'SEO', 'SEM', 'market research', 'campaign management', 'budget management', 'analytics', 'CRM', 'ROI'],
    missing: ['content strategy', 'marketing automation'],
    suggestions: [
      'Add specific content strategy examples — mention blog, social, or email content you\'ve created or managed',
      'Highlight marketing automation experience with specific platforms and workflows',
    ],
  },
  format_score: {
    score: 95,
    issues: ['Consider adding a dedicated "Projects" section to showcase major campaign case studies'],
    suggestions: ['Resume format is clean and ATS-friendly', 'Section headers are standard and parseable'],
  },
  skills_coverage: {
    score: 88,
    covered: ['Brand Management', 'Digital Marketing', 'SEO/SEM', 'Market Research', 'Campaign Management', 'Budget Management', 'Analytics', 'CRM'],
    missing: ['Content Strategy', 'Marketing Automation', 'A/B Testing'],
  },
  impact_score: {
    score: 82,
    strong_bullets: [
      'Increased brand awareness by 40% and drove $3.2M in incremental revenue',
      'Achieved 28% improvement in cost-per-acquisition',
      'Increased organic traffic by 65% while reducing paid search spend by 20%',
    ],
    weak_bullets: [
      'Managed social media content calendars — quantify engagement or follower growth numbers',
    ],
    suggestions: [
      'Add specific metrics to your Greenleaf Marketing Agency bullets',
      'Quantify the scale of campaigns you managed (reach, impressions, conversion rates)',
    ],
  },
  summary: 'Strong resume with excellent keyword coverage and quantified achievements. To boost your score further, add experience with content strategy and marketing automation (mentioned in preferred skills), and quantify remaining bullets. Your resume is well-formatted for ATS parsing.',
}

export const mockCountryResumeData: CountryResumeData = {
  resume: {
    header: {
      name: 'Jordan Rivera',
      title: 'Marketing Manager',
      email: 'jordan.rivera@email.com',
      phone: '(555) 234-5678',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/jordanrivera',
      website: null,
    },
    summary: 'Results-driven Marketing Manager with 6+ years of experience leading integrated campaigns across digital and traditional channels for consumer brands. Proven track record of growing brand awareness by 40%, managing $2M+ budgets, and delivering measurable ROI through data-driven strategy.',
    experience: [
      {
        company: 'Crestline Consumer Products',
        title: 'Marketing Manager',
        location: 'Chicago, IL',
        start_date: '2022',
        end_date: 'Present',
        bullets: [
          'Led rebranding initiative for flagship product line, increasing brand awareness by 40% and driving $3.2M in incremental revenue within 12 months',
          'Managed $2.1M annual marketing budget across digital, print, and event channels, achieving 28% improvement in cost-per-acquisition',
          'Designed and executed SEO/SEM strategy that increased organic traffic by 65% and reduced paid search spend by 20%',
        ],
      },
      {
        company: 'Meridian Brands Group',
        title: 'Senior Marketing Coordinator',
        location: 'Milwaukee, WI',
        start_date: '2019',
        end_date: '2022',
        bullets: [
          'Planned and executed 12+ multichannel campaigns per year, generating 35% increase in qualified leads',
          'Conducted market research and competitive analysis that informed pricing strategy, contributing to 18% revenue growth',
          'Managed CRM platform (HubSpot) and marketing automation workflows, improving email open rates by 22%',
        ],
      },
    ],
    skills: {
      core: ['Brand Management', 'Digital Marketing', 'SEO/SEM', 'Market Research', 'Campaign Strategy'],
      interpersonal: ['Cross-functional Leadership', 'Team Mentoring', 'Stakeholder Communication'],
      tools: ['HubSpot', 'Google Analytics', 'Salesforce', 'Tableau'],
    },
    education: [
      {
        institution: 'University of Wisconsin-Madison',
        degree: 'Bachelor of Business Administration',
        field: 'Marketing',
        graduation_date: '2018',
        gpa: '3.6',
        honors: "Dean's List",
      },
    ],
    certifications: ['Google Analytics Certified', 'HubSpot Inbound Marketing Certified'],
    ats_keywords_used: ['brand management', 'digital marketing', 'SEO', 'SEM', 'market research', 'campaign management', 'budget management', 'analytics', 'CRM', 'ROI'],
  },
  cover_letter: {
    greeting: 'Dear Hiring Manager,',
    opening_paragraph: "I'm writing to express my strong interest in the Marketing Manager position at Brightwave Consumer Brands. With over 6 years of experience leading integrated marketing campaigns and managing multimillion-dollar budgets, I'm excited to contribute to Brightwave's growth.",
    body_paragraphs: [
      'In my current role at Crestline Consumer Products, I led a rebranding initiative that increased brand awareness by 40% and drove $3.2M in incremental revenue. I manage a $2.1M annual budget across digital, print, and event channels, consistently improving cost-per-acquisition.',
      "What excites me most about Brightwave is your growth-oriented culture and focus on building brands that resonate with consumers. I'm eager to bring my experience in brand management, analytics, and team leadership to help drive your next chapter of growth.",
    ],
    closing_paragraph: "I'd welcome the chance to discuss how my background can contribute to Brightwave's continued success. Thank you for considering my application.",
    sign_off: 'Best regards,\nJordan Rivera',
  },
  cultural_tips: {
    work_culture: [
      'US workplaces value individual initiative and results-driven performance',
      'Open communication and sharing ideas in meetings is encouraged',
      'Networking is crucial for career advancement in the US market',
      'Work-life balance expectations vary significantly by company and industry',
    ],
    communication_style: 'Direct and professional. Americans tend to be straightforward in business communication while maintaining a friendly tone. Email is the primary mode of professional communication.',
    business_etiquette: [
      'Firm handshake and direct eye contact during introductions',
      'Business cards are exchanged casually, not ceremonially',
      'Punctuality is important for meetings and interviews',
      'First-name basis is common even with senior colleagues',
    ],
    common_mistakes: [
      'Including a photo on your resume — this is strongly discouraged in the US',
      'Writing a resume longer than 1 page for less than 10 years of experience',
      'Not tailoring the resume to each specific job description',
      'Forgetting to follow up with a thank-you email after interviews',
    ],
  },
  ats_analysis: {
    overall_score: 87,
    keyword_match: {
      matched: ['brand management', 'digital marketing', 'SEO', 'SEM', 'market research', 'campaign management', 'budget management', 'analytics', 'CRM', 'ROI'],
      missing: ['content strategy', 'marketing automation'],
    },
    country_notes: [
      'US ATS systems prioritize keyword density and exact phrase matching',
      'Standard section headers (Experience, Education, Skills) parse better in US ATS',
      'One-page resumes scan more efficiently through most US ATS platforms',
    ],
    format_compliance: 'Resume follows US formatting standards: no photo, no personal details, concise one-page format with standard section headers. ATS-optimized for US hiring platforms.',
  },
  interview_tips: {
    typical_process: 'US interviews typically involve a phone screen with HR (30 min), followed by 1-2 rounds of interviews with the hiring manager and team members. Final rounds may include a presentation or case study. The entire process usually takes 2-4 weeks.',
    dress_code: 'Business professional for traditional industries (finance, law). Business casual is acceptable for tech and creative industries. When in doubt, overdress slightly.',
    salary_discussion: 'Salary is typically discussed after receiving an offer, though some companies ask for expectations early. Research market rates on Glassdoor and Payscale. Negotiation is expected and acceptable.',
    follow_up: 'Send a personalized thank-you email within 24 hours of each interview round. Reference specific topics discussed and reiterate your interest in the role.',
    common_questions: [
      'Tell me about yourself and why you are interested in this role.',
      'Describe a time you led a project that exceeded expectations.',
      'How do you prioritize competing deadlines?',
      'What is your approach to managing a large marketing budget?',
      'Where do you see yourself in 5 years?',
    ],
  },
}

export const mockSkillGapData: SkillGapData = {
  role_title: 'Marketing Manager',
  overall_readiness: 72,
  skills: [
    { skill: 'Brand Management', required_level: 'advanced', current_level: 'advanced', gap_severity: 'none', recommendation: 'Your brand management skills are well-aligned with the requirements. Continue building case studies.' },
    { skill: 'Digital Marketing', required_level: 'advanced', current_level: 'intermediate', gap_severity: 'medium', recommendation: 'Deepen your digital marketing expertise, particularly in programmatic advertising and multi-channel attribution.' },
    { skill: 'SEO/SEM', required_level: 'advanced', current_level: 'intermediate', gap_severity: 'medium', recommendation: 'Get Google Ads certified and practice with real campaigns to bridge this gap.' },
    { skill: 'Marketing Automation', required_level: 'intermediate', current_level: 'basic', gap_severity: 'high', recommendation: 'Complete HubSpot Marketing Automation certification. This is a critical gap for the role.' },
    { skill: 'Content Strategy', required_level: 'intermediate', current_level: 'none', gap_severity: 'critical', recommendation: 'Develop content strategy skills through HubSpot Content Marketing certification and hands-on practice.' },
    { skill: 'Budget Management', required_level: 'advanced', current_level: 'advanced', gap_severity: 'none', recommendation: 'Strong alignment. Highlight your $2M+ budget management experience.' },
    { skill: 'A/B Testing', required_level: 'intermediate', current_level: 'basic', gap_severity: 'low', recommendation: 'Run 2-3 A/B tests on your own projects to build practical experience.' },
    { skill: 'Data Analytics', required_level: 'intermediate', current_level: 'intermediate', gap_severity: 'none', recommendation: 'Good match. Consider Tableau certification to stand out.' },
  ],
  learning_plan: [
    { order: 1, skill: 'Content Strategy', resource_name: 'HubSpot Content Marketing Certification', resource_url: 'https://academy.hubspot.com/courses/content-marketing', resource_type: 'certification', estimated_hours: 12, cost: 'free', priority: 'essential' },
    { order: 2, skill: 'Marketing Automation', resource_name: 'HubSpot Marketing Automation Course', resource_url: 'https://academy.hubspot.com/courses/marketing-automation', resource_type: 'course', estimated_hours: 8, cost: 'free', priority: 'essential' },
    { order: 3, skill: 'SEO/SEM', resource_name: 'Google Ads Certification', resource_url: 'https://skillshop.withgoogle.com/googleads', resource_type: 'certification', estimated_hours: 15, cost: 'free', priority: 'recommended' },
    { order: 4, skill: 'Digital Marketing', resource_name: 'Meta Marketing Science Professional', resource_url: 'https://www.facebook.com/business/learn/certification', resource_type: 'certification', estimated_hours: 25, cost: '$150', priority: 'recommended' },
    { order: 5, skill: 'A/B Testing', resource_name: 'CXL A/B Testing Mini-Course', resource_url: 'https://cxl.com/institute/online-course/ab-testing/', resource_type: 'tutorial', estimated_hours: 4, cost: 'free', priority: 'optional' },
  ],
  quick_wins: [
    'Complete HubSpot Content Marketing Certification (free, ~12 hours)',
    'Set up a basic A/B test on a personal project to demonstrate practical skills',
    'Add your marketing automation workflow examples to your portfolio',
  ],
  summary: 'You have a solid foundation for this role with strong brand management and budget skills. The critical gaps are in content strategy (not present) and marketing automation (basic level). Investing 2-3 weeks in HubSpot certifications would significantly boost your readiness from 72% to an estimated 85%+.',
}

export const mockFollowUpEmailData: FollowUpEmailData = {
  subject_line: 'Thank you for our conversation about the Marketing Manager role',
  body: "Dear [Interviewer Name],\n\nThank you for taking the time to meet with me today about the Marketing Manager position at Brightwave Consumer Brands. I truly enjoyed learning more about your team's approach to data-driven brand marketing and your exciting growth plans for the coming year.\n\nOur discussion about integrating SEO/SEM strategy with broader brand campaigns particularly resonated with me. My experience leading a rebranding initiative at Crestline that drove a 40% increase in brand awareness and $3.2M in incremental revenue directly aligns with the challenges you described.\n\nI was also excited to hear about Brightwave's plans to expand into new market segments. My background in market research and cross-functional campaign execution positions me well to contribute to these initiatives from day one.\n\nPlease don't hesitate to reach out if you need any additional information. I look forward to hearing about next steps.\n\nBest regards,\nJordan Rivera",
  key_points_referenced: [
    'Data-driven brand marketing approach',
    'SEO/SEM integration with brand campaigns',
    'New market segment expansion plans',
    'Cross-functional team collaboration',
  ],
  next_steps: 'Looking forward to hearing about the next steps in the interview process. I am available for any follow-up discussions at your convenience.',
  alternative_shorter_version: "Thank you for our conversation today about the Marketing Manager role at Brightwave. I enjoyed discussing your team's approach to data-driven brand marketing and how my experience driving 40% brand awareness growth at Crestline aligns with your goals. I look forward to hearing about next steps.\n\nBest regards,\nJordan Rivera",
}

export const mockRoastData: RoastResult = {
  overall_score: 62,
  verdict: 'Your resume reads like a LinkedIn post that forgot to include the results.',
  keyword_match: {
    score: 58,
    matched: ['marketing', 'campaign management', 'analytics', 'SEO', 'budget management', 'CRM'],
    missing: ['SEM', 'content strategy', 'marketing automation', 'A/B testing', 'cross-functional'],
  },
  impact_score: {
    score: 55,
    strong_bullets: [
      'Led rebranding initiative that increased brand awareness by 40% and drove $3.2M in incremental revenue',
      'Managed $2.1M annual marketing budget, achieving 28% improvement in cost-per-acquisition',
    ],
    weak_bullets: [
      'Responsible for managing social media content calendars',
      'Supported campaign execution for 8 consumer brand clients',
      'Created monthly analytics reports for client presentations',
    ],
  },
  ats_compatibility: {
    score: 71,
    issues: [
      'Missing key SEM-related terms that appear 3 times in the JD',
      'No dedicated "Projects" section to highlight major campaign wins',
      'Skills section lacks marketing automation tools mentioned in JD',
    ],
  },
  skills_gap: {
    score: 65,
    covered: ['Brand Management', 'Digital Marketing', 'SEO', 'Market Research', 'Analytics', 'CRM'],
    missing: ['SEM', 'Content Strategy', 'Marketing Automation', 'A/B Testing'],
  },
  formatting_issues: [
    'Consider a stronger opening summary — the current one is generic',
    'Third job entry bullets lack quantified metrics',
    'Certifications section could be expanded to match JD requirements',
  ],
  top_3_fixes: [
    'Add SEM and marketing automation keywords throughout — these appear multiple times in the JD but are absent from your resume',
    'Quantify every bullet point — your early career entries say "supported" and "created" with zero numbers attached',
    'Add a "Key Projects" section highlighting 2-3 campaign case studies with measurable outcomes',
  ],
  roast_lines: [
    'Your resume says "results-driven" but half your bullets forgot to include the results.',
    "I've seen stronger action verbs on a restaurant menu. 'Supported'? 'Created'? Did you also 'facilitated synergies'?",
    'You managed a $2M budget but your early career reads like you were an unpaid intern with a content calendar.',
    'The good news: you clearly know marketing. The bad news: your resume doesn\'t market you.',
    'This resume is like a movie trailer that spoils the ending in act one and forgets to mention act three exists.',
  ],
}
