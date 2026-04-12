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

  // Summary
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

// Rotation interval in milliseconds
const ROTATION_INTERVAL = 3000;

interface UseSmartPlaceholderOptions {
  type: keyof typeof PLACEHOLDER_EXAMPLES | string;
  enabled?: boolean;
  rotationInterval?: number;
}

export function useSmartPlaceholder({
  type,
  enabled = true,
  rotationInterval = ROTATION_INTERVAL,
}: UseSmartPlaceholderOptions) {
  const examples = PLACEHOLDER_EXAMPLES[type] || PLACEHOLDER_EXAMPLES.default;
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
