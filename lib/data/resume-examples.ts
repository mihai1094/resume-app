/**
 * Resume examples data for SEO landing pages.
 * Each entry powers a dedicated /resume-examples/[job] page.
 */

export interface ResumeExampleData {
  slug: string;
  jobTitle: string;
  industry: string;
  description: string;
  keywords: string[];
  highlights: string[];
  skills: string[];
  faqs: { question: string; answer: string }[];
}

export const resumeExamples: ResumeExampleData[] = [
  {
    slug: "software-engineer",
    jobTitle: "Software Engineer",
    industry: "Technology",
    description:
      "A software engineer resume needs to balance technical depth with clear impact. Recruiters scan for specific languages, frameworks, and measurable contributions — not just job duties. This guide covers what to include, how to quantify your work, and which templates pass ATS screening at top tech companies.",
    keywords: [
      "software engineer resume",
      "software developer resume",
      "software engineer resume example",
      "software engineer cv",
      "tech resume template",
    ],
    highlights: [
      "Lead with a skills section listing languages, frameworks, and tools relevant to the role",
      "Quantify every bullet: lines of code shipped, performance improvements (%), latency reduced (ms), team size led",
      "Use the exact job title from the posting — 'Software Engineer' vs 'Software Developer' matters to ATS",
      "Include GitHub profile and any notable open source contributions",
      "Keep to one page if under 5 years of experience; two pages is fine for senior roles",
    ],
    skills: [
      "Python", "JavaScript", "TypeScript", "React", "Node.js",
      "SQL", "PostgreSQL", "AWS", "Docker", "Kubernetes",
      "Git", "CI/CD", "REST APIs", "GraphQL", "Agile / Scrum",
    ],
    faqs: [
      {
        question: "What should a software engineer resume include?",
        answer:
          "A strong software engineer resume includes a skills section (languages, frameworks, tools), work experience with quantified achievements, education, and links to GitHub or portfolio projects. For senior roles, add a brief professional summary. Keep the format ATS-friendly: standard headers, no tables or graphics in critical sections.",
      },
      {
        question: "How long should a software engineer resume be?",
        answer:
          "One page for 0–5 years of experience. Two pages is acceptable for senior engineers with a track record spanning multiple companies or impactful projects. Recruiters at large tech companies typically spend 6–10 seconds on initial screening, so dense, well-organized content beats length.",
      },
      {
        question: "Should a software engineer list every technology they know?",
        answer:
          "No. Tailor the skills section to each job posting. Prioritize the languages and frameworks mentioned in the job description, then add supporting tools. A cluttered skills list with 40 items signals poor judgment rather than broad expertise.",
      },
      {
        question: "How do I show impact on a software engineer resume?",
        answer:
          "Use the formula: action verb + what you built/changed + measurable result. Example: 'Refactored authentication service, reducing average login latency from 800ms to 120ms for 200K daily active users.' Avoid bullets like 'Responsible for backend development.'",
      },
    ],
  },
  {
    slug: "marketing-manager",
    jobTitle: "Marketing Manager",
    industry: "Marketing",
    description:
      "A marketing manager resume must demonstrate both strategic thinking and measurable campaign results. Hiring managers want to see channel expertise, budget ownership, and numbers — not vague responsibilities. This guide shows you how to structure your resume for marketing director roles at any industry.",
    keywords: [
      "marketing manager resume",
      "marketing resume example",
      "marketing manager cv",
      "digital marketing resume",
      "marketing director resume",
    ],
    highlights: [
      "Open with a summary that names your specialty (digital, brand, content, demand gen) and a standout metric",
      "Every campaign bullet should include channel, budget managed, and outcome (leads, revenue, ROAS, CAC)",
      "List tools: HubSpot, Salesforce, Google Ads, Meta Ads Manager, Marketo, GA4, Semrush",
      "Separate strategy wins (launched new brand) from execution wins (managed $2M ad budget)",
      "Include any team management (managed team of X) — this is a strong signal for manager-level roles",
    ],
    skills: [
      "Content Marketing", "SEO / SEM", "Google Ads", "Meta Ads",
      "HubSpot", "Marketo", "Salesforce", "Google Analytics 4",
      "Email Marketing", "Brand Strategy", "Demand Generation",
      "A/B Testing", "Budget Management", "Team Leadership", "Copywriting",
    ],
    faqs: [
      {
        question: "What metrics should a marketing manager include on their resume?",
        answer:
          "Include revenue influenced, leads generated, conversion rate improvements, cost per acquisition (CPA), return on ad spend (ROAS), organic traffic growth, and email open/click rates. If exact numbers are confidential, use percentages or relative comparisons ('increased qualified leads by 45% YoY').",
      },
      {
        question: "Should a marketing manager resume include a portfolio?",
        answer:
          "Yes if you have one. Add a link in your contact section to a portfolio, case study deck, or LinkedIn. This is especially valuable for content, brand, or creative marketing roles where showing the work matters as much as describing it.",
      },
      {
        question: "How do I write a marketing manager resume with no specific channel expertise?",
        answer:
          "Focus on transferable skills: analytics, cross-functional collaboration, campaign planning, and stakeholder management. Highlight any tools you know (even Google Analytics or basic ad platforms), and target generalist or coordinator roles first to build channel experience.",
      },
    ],
  },
  {
    slug: "project-manager",
    jobTitle: "Project Manager",
    industry: "Business",
    description:
      "Project manager resumes live and die by metrics and methodology. Recruiters want to see project scale (budget, team size, timeline), delivery outcomes, and certifications like PMP or PRINCE2. This guide covers how to write a project manager resume that passes ATS and stands out to hiring managers.",
    keywords: [
      "project manager resume",
      "project manager cv",
      "pmp resume",
      "project management resume example",
      "senior project manager resume",
    ],
    highlights: [
      "Always list certifications (PMP, CAPM, PRINCE2, Agile, Scrum) prominently — they are ATS filter criteria",
      "Quantify every project: budget managed, team size, duration, and whether it was delivered on time",
      "Use the CAR method: Challenge → Action → Result for each bullet",
      "Include both waterfall and agile experience if you have it — many roles require flexibility",
      "Highlight stakeholder management and cross-functional coordination explicitly",
    ],
    skills: [
      "Project Planning", "Risk Management", "Stakeholder Management",
      "Agile / Scrum", "Waterfall", "PMP Certified",
      "Jira", "Asana", "MS Project", "Confluence",
      "Budget Management", "Change Management", "Resource Allocation", "Vendor Management",
    ],
    faqs: [
      {
        question: "Should a project manager resume list every project they managed?",
        answer:
          "No. Select 3–5 most impactful projects per role that are most relevant to the position you are applying for. Include project name, scope (budget/team size), and delivery outcome. A long list of small projects without outcomes is less compelling than three well-described wins.",
      },
      {
        question: "Does a PMP certification help with ATS screening?",
        answer:
          "Yes significantly. Many ATS filters include 'PMP' as a required keyword. Always write it out both ways: 'Project Management Professional (PMP)' and 'PMP Certified' to ensure matching regardless of how the system searches.",
      },
      {
        question: "What is the best resume format for a project manager?",
        answer:
          "A reverse-chronological format works best for most project managers. Use a clean two-column layout for senior roles (contact/skills in sidebar, experience in main column) or a single-column for strict ATS compatibility. Avoid infographic-style templates — they break ATS parsing.",
      },
    ],
  },
  {
    slug: "data-analyst",
    jobTitle: "Data Analyst",
    industry: "Technology",
    description:
      "Data analyst resumes must showcase technical tool proficiency alongside business impact. Hiring managers want SQL, Python or R, visualization tools, and specific examples of insights that drove decisions. This guide helps you structure a data analyst resume that passes ATS and impresses data teams.",
    keywords: [
      "data analyst resume",
      "data analyst cv",
      "data analyst resume example",
      "business analyst resume",
      "data science resume entry level",
    ],
    highlights: [
      "Lead with a skills section: SQL, Python, R, Tableau, Power BI, Excel, and any cloud platforms (BigQuery, Redshift, Snowflake)",
      "Every bullet should link analysis to a business outcome ('identified churn pattern that reduced monthly customer loss by 12%')",
      "Mention dataset sizes and query complexity when relevant (e.g., 'analyzed 50M+ row datasets')",
      "Include any dashboard or reporting tools and the stakeholder audience (executive, ops, marketing, etc.)",
      "Certifications (Google Data Analytics, AWS Data, Tableau Desktop Specialist) are strong ATS signals",
    ],
    skills: [
      "SQL", "Python", "R", "Tableau", "Power BI",
      "Excel / Google Sheets", "BigQuery", "Snowflake", "dbt",
      "A/B Testing", "Statistical Analysis", "Data Visualization",
      "ETL Pipelines", "Looker", "Machine Learning (basic)",
    ],
    faqs: [
      {
        question: "What should a data analyst resume include?",
        answer:
          "A data analyst resume should include a technical skills section (SQL, Python, visualization tools), work experience with specific analyses and their business impact, education (statistics, CS, or related field is a plus), and any certifications. Projects section is valuable if you are early in your career.",
      },
      {
        question: "Should a data analyst include a portfolio on their resume?",
        answer:
          "Yes. A GitHub profile with SQL queries, Python notebooks, or Tableau Public dashboards is a strong signal, especially for junior roles. Add the link in your contact section. Employers can assess your work quality before the interview.",
      },
      {
        question: "How do I write a data analyst resume with no experience?",
        answer:
          "Focus on coursework projects, personal data projects (Kaggle, public datasets), certifications, and any internships. Use the same structure as experienced analysts but with project bullets instead of work experience bullets. Quantify wherever possible — even academic projects can have measurable outcomes.",
      },
    ],
  },
  {
    slug: "nurse",
    jobTitle: "Nurse",
    industry: "Healthcare",
    description:
      "A nursing resume must highlight licensure, specialization, clinical experience, and patient outcomes. Recruiters in healthcare screen for specific certifications (RN, BSN, ACLS, BLS) and unit experience. This guide covers how to write a nurse resume that passes hospital ATS and gets interview callbacks.",
    keywords: [
      "nurse resume",
      "nursing resume example",
      "rn resume",
      "registered nurse resume",
      "nurse cv template",
    ],
    highlights: [
      "Always list your RN license number, state, and expiration date at the top of your resume",
      "Include all certifications: BLS, ACLS, PALS, NRP — these are hard ATS filter criteria",
      "Specify unit type (ICU, ER, Med-Surg, L&D, NICU, OR) and patient-to-nurse ratios",
      "Quantify patient load, acuity levels, and any outcomes you contributed to",
      "EMR systems you know (Epic, Cerner, Meditech) are important keywords for healthcare ATS",
    ],
    skills: [
      "Patient Assessment", "IV Therapy", "Wound Care", "Medication Administration",
      "Epic EMR", "Cerner", "BLS Certified", "ACLS Certified",
      "Critical Care", "Patient Education", "Care Coordination",
      "Triage", "Documentation", "Team Collaboration",
    ],
    faqs: [
      {
        question: "What should a nurse resume include?",
        answer:
          "A nurse resume should include your RN license and state, all active certifications (BLS, ACLS, PALS, etc.), clinical experience by unit type with patient ratios, education (BSN, ADN, or MSN), and key skills including EMR systems. Add a brief summary if you have 5+ years of experience to highlight specialization.",
      },
      {
        question: "How long should a nurse resume be?",
        answer:
          "One to two pages depending on experience. New graduate nurses should aim for one page focused on clinical rotations, certifications, and education. Experienced nurses with 5+ years across multiple units may need two pages to cover specializations adequately.",
      },
      {
        question: "Should a nurse include their license number on their resume?",
        answer:
          "Yes. Including your RN license number, issuing state, and expiration date is standard practice in nursing resumes. It signals professionalism and allows employers to verify credentials quickly.",
      },
    ],
  },
  {
    slug: "teacher",
    jobTitle: "Teacher",
    industry: "Education",
    description:
      "A teacher resume needs to demonstrate subject expertise, classroom management, and student outcomes. School district HR departments often use ATS, so including the right certifications and grade-level keywords matters. This guide helps you write a teaching resume that works for K-12 and higher education.",
    keywords: [
      "teacher resume",
      "teacher cv",
      "teaching resume example",
      "educator resume",
      "elementary teacher resume",
    ],
    highlights: [
      "List your teaching license/credential, state, grade level authorization, and expiration prominently",
      "Specify grade levels and subject areas in both your summary and experience bullets",
      "Include any curriculum development, IEP experience, or special education certifications",
      "Quantify outcomes: class size, standardized test improvement percentages, reading level gains",
      "Technology skills (Google Classroom, Canvas, Zoom, IXL, Khan Academy) are increasingly required keywords",
    ],
    skills: [
      "Curriculum Development", "Classroom Management", "Differentiated Instruction",
      "IEP Development", "Google Classroom", "Canvas LMS",
      "Formative Assessment", "Parent Communication",
      "STEM Education", "Special Education", "ELL Support",
      "Lesson Planning", "Data-Driven Instruction", "Positive Behavior Intervention",
    ],
    faqs: [
      {
        question: "What should a teacher resume include?",
        answer:
          "A teacher resume should include your teaching certificate and state endorsements, work experience with grade levels and subjects taught, education (degree and any graduate coursework), and a skills section covering instructional methods and educational technology. Add a summary if you are targeting a specific role type (elementary, secondary, special education).",
      },
      {
        question: "Should a teacher include a cover letter with their resume?",
        answer:
          "Yes, almost always. Teaching is one of the professions where cover letters are still widely read. Use it to explain your teaching philosophy, describe a specific student outcome you are proud of, and show genuine interest in the school or district.",
      },
      {
        question: "How do I write a teacher resume if I am changing from another career?",
        answer:
          "Lead with your student teaching or substitute teaching experience, any tutoring, coaching, or training roles, and your certification credentials. Emphasize transferable skills: communication, curriculum design (even informal), mentorship, and subject matter expertise from your previous field.",
      },
    ],
  },
  {
    slug: "graphic-designer",
    jobTitle: "Graphic Designer",
    industry: "Creative",
    description:
      "A graphic designer resume must balance visual polish with ATS compatibility. Portfolio link is non-negotiable. Recruiters screen for software proficiency (Adobe Creative Suite), design specialization (brand, UI/UX, motion), and industry experience. This guide covers how to write a designer resume that works.",
    keywords: [
      "graphic designer resume",
      "graphic designer cv",
      "designer resume example",
      "creative resume template",
      "ui ux designer resume",
    ],
    highlights: [
      "Always include a portfolio URL — it carries more weight than any resume section for designers",
      "List software explicitly: Adobe Illustrator, Photoshop, InDesign, Figma, After Effects, Sketch",
      "Specify design types you specialize in: brand identity, UI/UX, print, packaging, motion, social",
      "Quantify where possible: campaign reach, number of brand assets delivered, team size, client revenue",
      "Choose a visually polished template but ensure it is still ATS-readable (avoid full-image or chart-heavy layouts)",
    ],
    skills: [
      "Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign",
      "Figma", "Sketch", "After Effects", "Premiere Pro",
      "Brand Identity", "Typography", "Color Theory",
      "UI/UX Design", "Print Design", "Motion Graphics",
      "Client Presentation", "Art Direction",
    ],
    faqs: [
      {
        question: "Should a graphic designer use a creative resume template?",
        answer:
          "Yes, but with caution. A visually distinctive resume helps you stand out, but many ATS systems struggle to parse heavy graphical layouts. Use a template with visual polish in structure, typography, and color — not one built primarily around images, skill bars, or multi-column grids with text boxes.",
      },
      {
        question: "How important is a portfolio for a graphic designer resume?",
        answer:
          "Extremely. A portfolio link is the single most important addition to a designer resume. Without it, most hiring managers will not proceed regardless of your resume content. Include the URL prominently in your contact section and make sure the link is active before applying.",
      },
      {
        question: "How do I list freelance work on a graphic designer resume?",
        answer:
          "Create a 'Freelance Graphic Designer' entry with date range and list 3–5 notable client bullets. If you worked with recognizable brands, name them. Include the type of work (brand identity, social media assets, web design) and any quantifiable outcomes (reach, revenue, volume of deliverables).",
      },
    ],
  },
  {
    slug: "accountant",
    jobTitle: "Accountant",
    industry: "Finance",
    description:
      "An accountant resume needs to highlight certifications (CPA, CMA), software proficiency, and financial scope. Finance hiring managers look for the size of portfolios managed, accuracy record, and specific accounting functions. This guide covers how to write an accountant resume that stands out for public and private sector roles.",
    keywords: [
      "accountant resume",
      "accountant cv",
      "cpa resume",
      "accounting resume example",
      "senior accountant resume",
    ],
    highlights: [
      "Lead with CPA, CMA, or EA credentials in your name line or summary — these are top ATS filters",
      "Quantify everything: dollar amounts managed, number of accounts, error rates reduced, audit findings",
      "List software: QuickBooks, NetSuite, SAP, Oracle, Xero, Excel (advanced), Sage",
      "Specify accounting functions: accounts payable, receivable, payroll, general ledger, financial reporting, tax",
      "For public accounting, list industry specializations (healthcare, manufacturing, tech, nonprofit)",
    ],
    skills: [
      "QuickBooks", "NetSuite", "SAP", "Oracle Financials",
      "Excel (Advanced)", "Financial Reporting", "GAAP",
      "Accounts Payable / Receivable", "General Ledger", "Payroll",
      "Tax Preparation", "Audit Support", "Budget Forecasting",
      "CPA (if applicable)", "Month-End Close",
    ],
    faqs: [
      {
        question: "What should an accountant resume include?",
        answer:
          "An accountant resume should include certifications (CPA, CMA), work experience with dollar amounts and specific accounting functions, software proficiency, and education. Add a brief summary if you have 5+ years of experience. For entry-level, include internship experience and relevant coursework.",
      },
      {
        question: "Should an accountant include their CPA on their resume?",
        answer:
          "Yes, prominently. If you are CPA-eligible but not yet certified, write 'CPA Candidate (expected MM/YYYY)'. Many accounting job postings use CPA as an ATS filter, so placing it in your name line, summary, and certifications section maximizes keyword matching.",
      },
      {
        question: "How do I show impact on an accountant resume?",
        answer:
          "Use dollar amounts and percentages. Examples: 'Managed accounts payable for 200+ vendors averaging $4M monthly', 'Reduced month-end close time from 12 days to 7 days by implementing automated reconciliation', 'Identified $180K in unclaimed vendor credits during annual audit.'",
      },
    ],
  },
  {
    slug: "sales-representative",
    jobTitle: "Sales Representative",
    industry: "Sales",
    description:
      "A sales representative resume must demonstrate quota attainment, deal size, and sales methodology. Numbers are everything. Recruiters reject sales resumes with no revenue figures almost immediately. This guide shows you how to write a sales resume that proves you can close and gets you interview callbacks.",
    keywords: [
      "sales representative resume",
      "sales resume example",
      "sales rep cv",
      "account executive resume",
      "b2b sales resume",
    ],
    highlights: [
      "Every role should include quota attainment percentage and/or revenue generated",
      "Specify sales cycle length, average deal size, and territory scope",
      "Name the CRM you used (Salesforce, HubSpot, Outreach, Gong, ZoomInfo)",
      "Distinguish between hunter (new business) and farmer (account management) roles",
      "Include any President's Club, top rep awards, or ranking within team/region",
    ],
    skills: [
      "Salesforce CRM", "HubSpot", "Outreach", "Gong",
      "Pipeline Management", "Cold Outreach", "Negotiation",
      "Solution Selling", "MEDDIC / SPIN", "Account Management",
      "Forecasting", "Contract Negotiation", "B2B / SaaS Sales",
      "Prospecting", "Quota Attainment",
    ],
    faqs: [
      {
        question: "What should a sales representative resume include?",
        answer:
          "A sales resume must include quota attainment (as a percentage or dollar amount), revenue generated, deal sizes, CRM tools used, and sales methodology. Add awards (President's Club, Top Performer) and any formal sales training (Sandler, Challenger, SPIN, MEDDIC). Every role should have numbers.",
      },
      {
        question: "How do I write a sales resume if I missed quota?",
        answer:
          "Focus on other measurable wins: number of new accounts opened, pipeline built, year-over-year improvement in your metrics, or strong performance in a tough territory. Avoid lying about numbers — they will be checked in reference calls. Frame the context honestly and emphasize your growth trajectory.",
      },
      {
        question: "Should a sales representative include a summary on their resume?",
        answer:
          "Yes. A 2–3 line summary at the top naming your specialty (SaaS, enterprise, SMB, EMEA, inbound, outbound), best quota attainment metric, and years of experience is highly effective for sales resumes. Recruiters read the summary to decide whether to continue reading.",
      },
    ],
  },
  {
    slug: "product-manager",
    jobTitle: "Product Manager",
    industry: "Technology",
    description:
      "A product manager resume must prove you can define strategy, drive execution, and measure outcomes. PM hiring is highly selective — your resume needs to show product thinking, cross-functional leadership, and metrics. This guide covers how to write a product manager resume for FAANG, growth-stage, and enterprise companies.",
    keywords: [
      "product manager resume",
      "pm resume example",
      "product manager cv",
      "senior product manager resume",
      "product manager resume template",
    ],
    highlights: [
      "Use a summary that names your PM specialization (B2B, consumer, platform, growth, enterprise)",
      "Every feature or initiative bullet should include the business outcome (revenue impact, DAU growth, retention lift)",
      "Show cross-functional scope: engineering team size, design, data, legal, marketing you worked with",
      "Include discovery and delivery process: user research, A/B testing, roadmap ownership, launch metrics",
      "Certifications (AIPMM, PMC) are optional but tools (Jira, Figma, Amplitude, Mixpanel) are expected",
    ],
    skills: [
      "Product Strategy", "Roadmap Planning", "User Research",
      "A/B Testing", "Agile / Scrum", "Jira", "Figma",
      "Amplitude", "Mixpanel", "SQL (basic)", "Go-to-Market",
      "Stakeholder Management", "OKRs", "PRD Writing",
      "Cross-Functional Leadership", "Customer Discovery",
    ],
    faqs: [
      {
        question: "What should a product manager resume include?",
        answer:
          "A PM resume should include a summary with your product specialty, work experience with product outcomes (not just feature lists), skills (tools, methodologies, data), and education. Optionally, a brief 'Products I have shipped' section with links is powerful for portfolio-style applications.",
      },
      {
        question: "How do I show product ownership on a PM resume?",
        answer:
          "Use language like 'owned', 'defined strategy for', 'led discovery and delivery of'. Back every ownership claim with an outcome: 'Owned checkout redesign that reduced cart abandonment by 18%'. Avoid bullets like 'worked on' or 'helped with' — they signal a supporting, not owning, role.",
      },
      {
        question: "Should a PM resume include technical skills?",
        answer:
          "Yes, to a degree. Mentioning SQL, basic data tools (Amplitude, Mixpanel), and API familiarity signals you can work closely with engineers. You do not need to be a developer, but showing technical literacy is expected at most product-forward companies, especially in senior roles.",
      },
    ],
  },
];

export function getResumeExample(slug: string): ResumeExampleData | undefined {
  return resumeExamples.find((ex) => ex.slug === slug);
}
