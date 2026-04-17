"use client";

import { useState, useEffect, useCallback } from "react";

// Placeholder examples for different field types
const PLACEHOLDER_EXAMPLES: Record<string, string[]> = {
  // Personal Info
  firstName: ["Jordan", "Sarah", "Michael", "Priya", "David", "Elena"],
  lastName: ["Rivera", "Johnson", "Chen", "Patel", "Williams", "Müller"],
  jobTitle: [
    "Marketing Manager",
    "Registered Nurse",
    "Software Engineer",
    "High School Teacher",
    "Financial Analyst",
    "Graphic Designer",
    "Lawyer",
    "Project Manager",
    "Social Worker",
    "UX Designer",
  ],
  email: [
    "your.name@email.com",
    "professional@example.com",
    "contact@yourname.com",
  ],
  phone: ["+1 (555) 123-4567", "(555) 987-6543", "+44 20 7123 4567"],
  location: ["Chicago, IL", "New York, NY", "London, UK", "Remote", "Toronto, ON"],
  linkedin: ["linkedin.com/in/yourprofile", "linkedin.com/in/yourname"],
  website: ["yourportfolio.com", "yourname.com", "behance.net/yourname"],

  // Work Experience
  company: [
    "City Hospital",
    "Bright Path Agency",
    "National Bank",
    "Lincoln School District",
    "Reed & Partners LLP",
    "Global Health NGO",
    "Apex Consulting",
  ],
  position: [
    "Senior Marketing Manager",
    "Registered Nurse",
    "Financial Analyst",
    "Lead Teacher",
    "Associate Attorney",
    "Operations Director",
    "HR Business Partner",
  ],
  workDescription: [
    "Led cross-functional team of 8 to deliver campaign ahead of schedule...",
    "Managed patient care for 15+ patients per shift, improving discharge outcomes by 20%...",
    "Increased client retention by 35% through relationship management and tailored outreach...",
    "Designed and taught curriculum for 120 students across three grade levels...",
    "Negotiated contracts saving the organization $500K annually...",
    "Managed $2M department budget, consistently delivering 10% under target...",
  ],
  bullet: [
    "Increased revenue by 25% through targeted marketing campaigns",
    "Managed a caseload of 40+ clients, achieving 90% satisfaction rate",
    "Reduced patient wait times by 30% through process improvements",
    "Developed curriculum adopted across 12 schools in the district",
    "Led team of 6 to deliver project two weeks ahead of schedule",
    "Automated reporting processes saving 15 hours per week",
  ],

  // Education
  school: [
    "University of Michigan",
    "Northwestern University",
    "King's College London",
    "University of Toronto",
    "Howard University",
    "Sciences Po Paris",
  ],
  degree: [
    "Bachelor of Science",
    "Master of Business Administration",
    "Bachelor of Arts",
    "Master of Science",
    "Juris Doctor",
    "Bachelor of Nursing",
    "Ph.D.",
  ],
  fieldOfStudy: [
    "Marketing & Communications",
    "Nursing",
    "Business Administration",
    "Education",
    "Law",
    "Psychology",
    "Finance",
    "Graphic Design",
  ],
  gpa: ["3.8/4.0", "3.9", "First Class Honours", "Summa Cum Laude", "Distinction"],

  // Projects
  projectName: [
    "Community Outreach Campaign",
    "Patient Education Program",
    "Brand Refresh Initiative",
    "Literacy Improvement Project",
    "Process Automation Rollout",
    "Annual Fundraising Strategy",
  ],
  projectDescription: [
    "Designed and executed a multi-channel outreach campaign reaching 10,000+ community members...",
    "Developed a patient education series that reduced hospital readmissions by 18%...",
    "Led a brand refresh for a regional nonprofit, increasing awareness by 40%...",
    "Launched a literacy program serving 200+ students, raising average reading levels by one grade...",
    "Automated invoicing workflow, reducing manual processing time by 60%...",
  ],
  projectUrl: [
    "yourportfolio.com/project",
    "behance.net/yourname/project",
    "drive.google.com/file/...",
    "issuu.com/yourname/docs/project",
  ],

  // Certifications
  certName: [
    "Project Management Professional (PMP)",
    "Registered Nurse (RN) License",
    "Certified Public Accountant (CPA)",
    "Google Analytics Certification",
    "Bar Admission — State of New York",
    "SHRM Certified Professional",
    "First Aid & CPR Certification",
    "HubSpot Marketing Certification",
  ],
  certIssuer: [
    "Project Management Institute",
    "State Board of Nursing",
    "AICPA",
    "Google",
    "State Bar Association",
    "SHRM",
    "American Red Cross",
    "HubSpot Academy",
  ],

  // Summary (generic fallback — industry-specific examples live in SUMMARY_BY_INDUSTRY)
  summary: [
    "Strategic marketing manager with 7+ years of experience driving brand growth and audience engagement across digital and traditional channels...",
    "Dedicated registered nurse with 5+ years of experience in acute care settings, committed to delivering compassionate, evidence-based patient care...",
    "Results-driven financial analyst with a track record of identifying cost-saving opportunities and supporting data-driven business decisions...",
    "Passionate educator with 10+ years of experience designing engaging curricula and improving student outcomes in diverse classroom settings...",
    "Client-focused attorney with expertise in contract negotiation and dispute resolution, helping businesses protect their interests efficiently...",
  ],

  // Skills
  skill: [
    "Project Management",
    "Patient Care",
    "Financial Reporting",
    "Curriculum Design",
    "Brand Strategy",
    "Contract Negotiation",
    "Data Analysis",
    "Team Leadership",
    "Client Relations",
    "Microsoft Office",
  ],

  // Generic
  default: ["Enter your information here", "Type something..."],
};

/**
 * Industry-specific summary placeholders. When the user selects an industry, we
 * rotate through examples that mention typical tools/domains for that field —
 * this nudges them to include concrete skills recruiters scan for.
 */
const SUMMARY_BY_INDUSTRY: Record<string, string[]> = {
  technology: [
    "Full-stack engineer with 6+ years building production apps in React, TypeScript, and Node.js. Experienced with AWS, Docker, and PostgreSQL — shipped features serving 500K+ monthly users...",
    "Senior backend engineer specializing in distributed systems with Go, Python, and Kubernetes. Designed microservices processing 10M+ requests/day with sub-100ms latency...",
    "Product-minded frontend engineer fluent in Next.js, TypeScript, and modern design systems. Led the rebuild of the checkout flow, lifting conversion by 22%...",
  ],
  engineering: [
    "Mechanical engineer with 8+ years in aerospace manufacturing, skilled in SolidWorks, ANSYS, and GD&T. Led redesign of a flight-critical component that cut weight by 18%...",
    "Civil engineer specializing in structural analysis and AutoCAD, with PE licensure across three states. Delivered $40M of infrastructure projects on schedule and under budget...",
  ],
  finance: [
    "Senior financial analyst with 7+ years in FP&A across SaaS and fintech. Advanced Excel, SQL, and Tableau user — built forecasting models that improved forecast accuracy by 15%...",
    "Investment banking associate with M&A experience across $2B+ in deal volume. Deep expertise in DCF modeling, LBO analysis, and industry comps across consumer and tech verticals...",
  ],
  healthcare: [
    "Registered nurse with 5+ years in acute and emergency care, committed to compassionate, evidence-based patient care. BLS, ACLS, and PALS certified, trained in Epic and Cerner EHR...",
    "Clinical pharmacist with 8+ years across hospital and retail settings, specializing in oncology and anticoagulation management. Board-certified (BCOP) with PharmD from UCSF...",
  ],
  marketing: [
    "Growth marketing manager with 7+ years scaling B2B SaaS companies via paid acquisition, SEO, and lifecycle campaigns. Hands-on with HubSpot, Google Ads, and Segment — drove $12M in pipeline...",
    "Brand strategist with a decade leading multi-channel campaigns for Fortune 500 clients. Expert in consumer research, creative direction, and Adobe Creative Suite...",
  ],
  sales: [
    "Enterprise account executive with 6+ years closing six- and seven-figure SaaS deals. Consistently 120%+ of quota using MEDDIC and Command of the Message frameworks, Salesforce power user...",
    "Sales development leader who built and scaled SDR teams from 3 to 25 reps. Expert in Outreach, Gong, and pipeline generation playbooks — delivered 4x YoY pipeline growth...",
  ],
  education: [
    "Passionate K-12 educator with 10+ years designing standards-aligned curricula and improving student outcomes. Skilled in differentiated instruction and data-driven assessment...",
    "Instructional designer with a Master's in Learning Sciences, expert in Articulate 360 and Canvas LMS. Built blended-learning programs adopted across 15 districts...",
  ],
  legal: [
    "Corporate attorney with 6+ years in M&A and commercial contracts across tech and healthcare. Admitted in New York and California — managed diligence on transactions totaling $800M+...",
    "Litigation associate with deep trial experience in complex commercial disputes. Drafted and argued dispositive motions in federal and state court with a 78% success rate...",
  ],
  consulting: [
    "Management consultant with 5+ years at a top-tier firm advising Fortune 500 clients on growth strategy, operations, and digital transformation. Expert in Excel, SQL, and Tableau...",
    "Strategy consultant specializing in go-to-market and pricing across industrial and technology sectors. Led engagements delivering $50M+ in annualized client impact...",
  ],
  manufacturing: [
    "Operations manager with 9+ years driving lean transformations in automotive and industrial plants. Six Sigma Black Belt — delivered $4.2M in annualized cost savings across three facilities...",
    "Supply chain lead skilled in SAP, demand planning, and vendor negotiation. Reduced inventory carrying costs by 28% while maintaining 99% OTIF across a global network...",
  ],
  retail: [
    "Retail operations leader with 8+ years scaling store footprints and omnichannel experiences. Expert in P&L management, workforce planning, and merchandising analytics...",
    "Buyer and merchandiser with a decade selecting assortments for fashion and lifestyle brands. Launched private-label lines generating $25M in first-year revenue...",
  ],
};

// Rotation interval in milliseconds
const ROTATION_INTERVAL = 3000;

/**
 * Returns summary placeholder examples tailored to the given industry.
 * Falls back to the generic `summary` pool when the industry is unset or
 * not yet covered — callers can pass the result into `useSmartPlaceholder`
 * via the `examples` override.
 */
export function getSummaryPlaceholdersForIndustry(industry?: string | null): string[] {
  if (!industry) return PLACEHOLDER_EXAMPLES.summary;
  return SUMMARY_BY_INDUSTRY[industry] ?? PLACEHOLDER_EXAMPLES.summary;
}

interface UseSmartPlaceholderOptions {
  type: keyof typeof PLACEHOLDER_EXAMPLES | string;
  /** Optional override for the pool of examples — takes precedence over `type` when non-empty. */
  examples?: string[];
  enabled?: boolean;
  rotationInterval?: number;
}

export function useSmartPlaceholder({
  type,
  examples: examplesOverride,
  enabled = true,
  rotationInterval = ROTATION_INTERVAL,
}: UseSmartPlaceholderOptions) {
  const examples =
    examplesOverride && examplesOverride.length > 0
      ? examplesOverride
      : PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate through examples
  useEffect(() => {
    if (!enabled || examples.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % examples.length);
        setIsAnimating(false);
      }, 150); // Short fade duration
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [enabled, examples.length, rotationInterval]);

  const getNextExample = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  }, [examples.length]);

  return {
    placeholder: examples[currentIndex],
    isAnimating,
    getNextExample,
    allExamples: examples,
  };
}

// Component version for easier use
export function getPlaceholder(type: keyof typeof PLACEHOLDER_EXAMPLES | string): string {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  return examples[0];
}

// Get random placeholder
export function getRandomPlaceholder(type: keyof typeof PLACEHOLDER_EXAMPLES | string): string {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
  return examples[Math.floor(Math.random() * examples.length)];
}

export type PlaceholderType = keyof typeof PLACEHOLDER_EXAMPLES;
