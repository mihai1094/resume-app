import { CURRENT_RESUME_SCHEMA_VERSION, ResumeData } from "@/lib/types/resume";

/**
 * Sample resume data used for template previews.
 * Shows a realistic, well-filled resume so users can judge template layouts.
 */
export const SAMPLE_RESUME: ResumeData = {
  schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
  personalInfo: {
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@email.com",
    phone: "(555) 234-5678",
    location: "San Francisco, CA",
    website: "sarahmitchell.dev",
    linkedin: "linkedin.com/in/sarahmitchell",
    github: "github.com/sarahmitchell",
    jobTitle: "Senior Software Engineer",
    summary:
      "Full-stack engineer with 8+ years of experience building scalable web applications and leading cross-functional teams. Passionate about clean architecture, developer experience, and shipping products that make a real impact. Drove 40% improvement in deployment velocity at TechFlow through CI/CD modernization.",
    industry: "technology",
    seniorityLevel: "senior",
  },
  workExperience: [
    {
      id: "sample-exp-1",
      company: "TechFlow Inc.",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      current: true,
      description: [
        "Led redesign of core platform architecture, resulting in 40% increase in user engagement and 25% reduction in page load times",
        "Established CI/CD pipelines reducing deployment time from 2 hours to 15 minutes across 12 microservices",
        "Mentored team of 4 junior engineers through weekly code reviews and pair programming sessions",
        "Designed and implemented real-time analytics dashboard processing 2M+ events daily",
      ],
    },
    {
      id: "sample-exp-2",
      company: "StartupXYZ",
      position: "Software Engineer",
      location: "Remote",
      startDate: "2018-06",
      endDate: "2021-02",
      current: false,
      description: [
        "Developed microservices handling 500k+ daily transactions with 99.9% uptime",
        "Improved API performance by 60% through Redis caching and query optimization",
        "Built real-time notification system serving 100k+ users with WebSocket integration",
      ],
    },
    {
      id: "sample-exp-3",
      company: "Digital Agency Co.",
      position: "Junior Developer",
      location: "New York, NY",
      startDate: "2016-09",
      endDate: "2018-05",
      current: false,
      description: [
        "Built responsive web applications for 15+ clients using React and Node.js",
        "Reduced client onboarding time by 30% through automated setup tooling",
      ],
    },
  ],
  education: [
    {
      id: "sample-edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Berkeley, CA",
      startDate: "2012-09",
      endDate: "2016-05",
      current: false,
      gpa: "3.8 / 4.0",
    },
  ],
  skills: [
    { id: "sample-sk-1", name: "TypeScript", category: "Languages", level: "expert" },
    { id: "sample-sk-2", name: "React", category: "Frontend", level: "expert" },
    { id: "sample-sk-3", name: "Node.js", category: "Backend", level: "expert" },
    { id: "sample-sk-4", name: "PostgreSQL", category: "Database", level: "advanced" },
    { id: "sample-sk-5", name: "AWS", category: "Cloud", level: "advanced" },
    { id: "sample-sk-6", name: "Docker", category: "DevOps", level: "advanced" },
    { id: "sample-sk-7", name: "GraphQL", category: "API", level: "advanced" },
    { id: "sample-sk-8", name: "Python", category: "Languages", level: "intermediate" },
    { id: "sample-sk-9", name: "Redis", category: "Database", level: "intermediate" },
    { id: "sample-sk-10", name: "Kubernetes", category: "DevOps", level: "intermediate" },
  ],
  projects: [
    {
      id: "sample-proj-1",
      name: "OpenSource CLI Tool",
      description: "Built a developer CLI tool for automated code scaffolding with 2k+ GitHub stars",
      technologies: ["TypeScript", "Node.js", "Commander.js"],
      url: "github.com/sarahmitchell/scaffold-cli",
      startDate: "2022-01",
    },
  ],
  languages: [
    { id: "sample-lang-1", name: "English", level: "native" },
    { id: "sample-lang-2", name: "Spanish", level: "conversational" },
  ],
  certifications: [
    {
      id: "sample-cert-1",
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-06",
    },
  ],
  courses: [],
  hobbies: [
    { id: "sample-hobby-1", name: "Open source contributing" },
    { id: "sample-hobby-2", name: "Rock climbing" },
    { id: "sample-hobby-3", name: "Photography" },
  ],
  extraCurricular: [],
  customSections: [],
};
