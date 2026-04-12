import {
  CURRENT_RESUME_SCHEMA_VERSION,
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Project,
  Language,
  Certification,
  Course,
  Hobby,
  ExtraCurricular,
  CustomSection,
} from "@/lib/types/resume";

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

/** Reset ID counter between tests if needed */
export function resetIdCounter() {
  idCounter = 0;
}

// ─── Building blocks ───

export function createWorkExperience(
  overrides: Partial<WorkExperience> = {}
): WorkExperience {
  return {
    id: nextId("exp"),
    company: "Acme Corp",
    position: "Software Engineer",
    location: "Remote",
    startDate: "2020-01",
    endDate: "2023-01",
    current: false,
    description: [
      "Led development of microservices architecture serving 1M+ requests daily",
      "Reduced API response time by 40% through query optimization",
      "Mentored 3 junior developers through code reviews and pair programming",
    ],
    ...overrides,
  };
}

export function createEducation(
  overrides: Partial<Education> = {}
): Education {
  return {
    id: nextId("edu"),
    institution: "MIT",
    degree: "Bachelor of Science",
    field: "Computer Science",
    location: "Cambridge, MA",
    startDate: "2016-09",
    endDate: "2020-05",
    current: false,
    ...overrides,
  };
}

export function createSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: nextId("skill"),
    name: "TypeScript",
    category: "Programming",
    level: "advanced",
    ...overrides,
  };
}

export function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: nextId("proj"),
    name: "Open Source CLI Tool",
    description: "A developer productivity tool with 2k+ GitHub stars",
    technologies: ["TypeScript", "Node.js"],
    url: "https://example.com",
    ...overrides,
  };
}

export function createLanguage(overrides: Partial<Language> = {}): Language {
  return {
    id: nextId("lang"),
    name: "English",
    level: "native",
    ...overrides,
  };
}

export function createCertification(
  overrides: Partial<Certification> = {}
): Certification {
  return {
    id: nextId("cert"),
    name: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023-06",
    type: "certification",
    ...overrides,
  };
}

export function createCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: nextId("course"),
    name: "Machine Learning Specialization",
    institution: "Stanford Online",
    date: "2023-03",
    ...overrides,
  };
}

export function createHobby(overrides: Partial<Hobby> = {}): Hobby {
  return {
    id: nextId("hobby"),
    name: "Open source contributing",
    ...overrides,
  };
}

export function createExtraCurricular(
  overrides: Partial<ExtraCurricular> = {}
): ExtraCurricular {
  return {
    id: nextId("extra"),
    title: "Tech Meetup Organizer",
    organization: "Local Dev Community",
    role: "Lead Organizer",
    startDate: "2021-01",
    current: true,
    description: ["Organized monthly meetups with 50+ attendees"],
    ...overrides,
  };
}

export function createCustomSection(
  overrides: Partial<CustomSection> = {}
): CustomSection {
  return {
    id: nextId("section"),
    title: "Publications",
    items: [
      {
        id: nextId("item"),
        title: "Building Scalable APIs",
        description: "Published in Tech Magazine, 2023",
      },
    ],
    ...overrides,
  };
}

// ─── Resume-level factories ───

/** Empty resume — blank slate, all arrays empty */
export function createEmptyResume(): ResumeData {
  return {
    schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    workExperience: [],
    education: [],
    skills: [],
  };
}

/** Minimal resume — just personal info + 1 work experience */
export function createMinimalResume(): ResumeData {
  return {
    schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
    personalInfo: {
      firstName: "Alex",
      lastName: "Taylor",
      email: "alex@example.com",
      phone: "555-555-5555",
      location: "Denver, CO",
      summary: "",
    },
    workExperience: [createWorkExperience()],
    education: [],
    skills: [],
  };
}

/** Complete resume — all sections populated, good for template & scoring tests */
export function createCompleteResume(): ResumeData {
  return {
    schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
    personalInfo: {
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      website: "sarahmitchell.dev",
      linkedin: "linkedin.com/in/sarahmitchell",
      github: "github.com/sarahmitchell",
      jobTitle: "Senior Software Engineer",
      summary:
        "Experienced software engineer with 8+ years building scalable web applications. Led teams of 5-10 engineers, driving 40% improvement in deployment velocity.",
      industry: "technology",
      seniorityLevel: "senior",
    },
    workExperience: [
      createWorkExperience({
        company: "TechFlow Inc.",
        position: "Senior Software Engineer",
        startDate: "2021-03",
        current: true,
        endDate: undefined,
        description: [
          "Led redesign of core platform, resulting in 40% increase in user engagement",
          "Established CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
          "Mentored team of 4 junior engineers through weekly code reviews",
        ],
      }),
      createWorkExperience({
        company: "StartupXYZ",
        position: "Software Engineer",
        startDate: "2018-06",
        endDate: "2021-02",
        description: [
          "Developed microservices handling 500k+ daily transactions",
          "Improved API performance by 60% through caching and query optimization",
          "Built real-time notification system serving 100k+ users",
        ],
      }),
    ],
    education: [
      createEducation(),
      createEducation({
        institution: "Community College",
        degree: "Associate",
        field: "Mathematics",
        startDate: "2014-09",
        endDate: "2016-05",
      }),
    ],
    skills: [
      createSkill({ name: "TypeScript", category: "Programming", level: "expert" }),
      createSkill({ name: "React", category: "Frontend", level: "expert" }),
      createSkill({ name: "Node.js", category: "Backend", level: "advanced" }),
      createSkill({ name: "PostgreSQL", category: "Database", level: "advanced" }),
      createSkill({ name: "AWS", category: "Cloud", level: "advanced" }),
      createSkill({ name: "Docker", category: "DevOps", level: "intermediate" }),
      createSkill({ name: "GraphQL", category: "API", level: "advanced" }),
      createSkill({ name: "Python", category: "Programming", level: "intermediate" }),
      createSkill({ name: "Redis", category: "Database", level: "intermediate" }),
      createSkill({ name: "Kubernetes", category: "DevOps", level: "intermediate" }),
      createSkill({ name: "CI/CD", category: "DevOps", level: "advanced" }),
      createSkill({ name: "Git", category: "Tools", level: "expert" }),
    ],
    projects: [createProject()],
    languages: [
      createLanguage({ name: "English", level: "native" }),
      createLanguage({ name: "Spanish", level: "conversational" }),
    ],
    certifications: [createCertification()],
    courses: [createCourse()],
    hobbies: [createHobby()],
    extraCurricular: [createExtraCurricular()],
    customSections: [createCustomSection()],
  };
}

/** Resume with only specified sections — useful for targeted tests */
export function createResumeWith(
  overrides: Partial<ResumeData> = {}
): ResumeData {
  return {
    ...createEmptyResume(),
    ...overrides,
  };
}

/** Resume with weak bullets (no action verbs, no metrics) — for scoring edge cases */
export function createWeakResume(): ResumeData {
  return createResumeWith({
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "555-0000",
      location: "Somewhere",
    },
    workExperience: [
      createWorkExperience({
        description: [
          "Was responsible for the website",
          "Helped with various tasks",
          "Worked on the team project",
        ],
      }),
    ],
    skills: [
      createSkill({ name: "Teamwork", category: "Soft Skills" }),
      createSkill({ name: "Communication", category: "Soft Skills" }),
      createSkill({ name: "Leadership", category: "Soft Skills" }),
    ],
  });
}
