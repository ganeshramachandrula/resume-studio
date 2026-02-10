import type { ParsedJD, ResumeData, CoverLetterData, LinkedInData, ColdEmailData, InterviewPrepData, ATSScoreData } from '@/types/documents'

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
