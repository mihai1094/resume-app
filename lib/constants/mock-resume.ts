import { ResumeData } from "@/lib/types/resume";

/**
 * Mock resume data for template gallery previews
 * Designed to showcase template features with realistic content
 */
export const MOCK_RESUME_DATA: ResumeData = {
  personalInfo: {
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "sarahmitchell.dev",
    linkedin: "linkedin.com/in/sarahmitchell",
    github: "github.com/sarahmitchell",
    jobTitle: "Senior Product Designer",
    summary:
      "Creative and strategic Product Designer with 8+ years of experience crafting user-centered digital experiences. Proven track record of leading design systems, conducting user research, and collaborating with cross-functional teams to deliver products that drive business growth and user satisfaction.",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "TechFlow Inc.",
      position: "Senior Product Designer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      current: true,
      description: [
        "Led the redesign of the core product dashboard, resulting in a 40% increase in user engagement and 25% reduction in support tickets",
        "Established and maintained a comprehensive design system used across 12 products, improving design consistency by 60%",
        "Mentored a team of 4 junior designers, conducting weekly design critiques and career development sessions",
      ],
    },
    {
      id: "exp-2",
      company: "DesignHub Agency",
      position: "Product Designer",
      location: "New York, NY",
      startDate: "2018-06",
      endDate: "2021-02",
      current: false,
      description: [
        "Designed end-to-end user experiences for 20+ client projects across fintech, healthcare, and e-commerce sectors",
        "Conducted user research studies with 500+ participants, translating insights into actionable design improvements",
        "Collaborated with engineering teams to ensure pixel-perfect implementation of designs",
      ],
    },
    {
      id: "exp-3",
      company: "StartupXYZ",
      position: "UI/UX Designer",
      location: "Boston, MA",
      startDate: "2016-01",
      endDate: "2018-05",
      current: false,
      description: [
        "Created wireframes, prototypes, and high-fidelity mockups for mobile and web applications",
        "Improved conversion rates by 35% through A/B testing and iterative design optimization",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Rhode Island School of Design",
      degree: "Master of Fine Arts",
      field: "Graphic Design",
      location: "Providence, RI",
      startDate: "2014-09",
      endDate: "2016-05",
      current: false,
      gpa: "3.9",
    },
    {
      id: "edu-2",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Arts",
      field: "Cognitive Science",
      location: "Berkeley, CA",
      startDate: "2010-09",
      endDate: "2014-05",
      current: false,
    },
  ],
  skills: [
    { id: "skill-1", name: "Figma", category: "Design Tools", level: "expert" },
    { id: "skill-2", name: "Sketch", category: "Design Tools", level: "expert" },
    { id: "skill-3", name: "Adobe XD", category: "Design Tools", level: "advanced" },
    { id: "skill-4", name: "Prototyping", category: "Design Skills", level: "expert" },
    { id: "skill-5", name: "User Research", category: "Research", level: "advanced" },
    { id: "skill-6", name: "Design Systems", category: "Design Skills", level: "expert" },
    { id: "skill-7", name: "HTML/CSS", category: "Development", level: "intermediate" },
    { id: "skill-8", name: "React", category: "Development", level: "intermediate" },
    { id: "skill-9", name: "Usability Testing", category: "Research", level: "advanced" },
    { id: "skill-10", name: "Wireframing", category: "Design Skills", level: "expert" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "DesignKit Pro",
      description:
        "Open-source design system toolkit with 200+ components, used by 5,000+ designers worldwide",
      technologies: ["Figma", "React", "Storybook", "TypeScript"],
      url: "designkitpro.com",
      github: "github.com/designkitpro",
    },
    {
      id: "proj-2",
      name: "UX Research Hub",
      description:
        "Platform for organizing and sharing user research insights across teams",
      technologies: ["Figma", "Notion API", "Next.js"],
    },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "native" },
    { id: "lang-2", name: "Spanish", level: "fluent" },
    { id: "lang-3", name: "French", level: "conversational" },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Google UX Design Professional Certificate",
      issuer: "Google",
      date: "2023-06",
      type: "certification",
    },
    {
      id: "cert-2",
      name: "Certified Usability Analyst",
      issuer: "Human Factors International",
      date: "2022-03",
      type: "certification",
    },
  ],
};

/**
 * Condensed mock data for smaller preview sizes
 * Same person, fewer items for cleaner preview rendering
 */
export const MOCK_RESUME_CONDENSED: ResumeData = {
  ...MOCK_RESUME_DATA,
  workExperience: MOCK_RESUME_DATA.workExperience.slice(0, 2).map((exp) => ({
    ...exp,
    description: exp.description.slice(0, 2),
  })),
  education: MOCK_RESUME_DATA.education.slice(0, 1),
  skills: MOCK_RESUME_DATA.skills.slice(0, 6),
  projects: undefined,
  certifications: undefined,
  languages: MOCK_RESUME_DATA.languages?.slice(0, 2),
};
