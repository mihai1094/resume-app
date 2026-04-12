import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { testRouteGuard } from "../guard";
import type { ResumeData } from "@/lib/types/resume";

const RESUMES_TO_SEED: Array<{
  id: string;
  name: string;
  templateId: string;
  builder: () => ResumeData;
}> = [
  {
    id: "test-resume-complete",
    name: "Full Stack Developer Resume",
    templateId: "modern",
    builder: () => ({
      schemaVersion: 2,
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
        {
          id: "exp-1",
          company: "TechFlow Inc.",
          position: "Senior Software Engineer",
          location: "Remote",
          startDate: "2021-03",
          current: true,
          description: [
            "Led redesign of core platform, resulting in 40% increase in user engagement",
            "Established CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
            "Mentored team of 4 junior engineers through weekly code reviews",
          ],
        },
        {
          id: "exp-2",
          company: "StartupXYZ",
          position: "Software Engineer",
          location: "Remote",
          startDate: "2018-06",
          endDate: "2021-02",
          current: false,
          description: [
            "Developed microservices handling 500k+ daily transactions",
            "Improved API performance by 60% through caching and query optimization",
            "Built real-time notification system serving 100k+ users",
          ],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "MIT",
          degree: "Bachelor of Science",
          field: "Computer Science",
          location: "Cambridge, MA",
          startDate: "2016-09",
          endDate: "2020-05",
          current: false,
        },
      ],
      skills: [
        { id: "s-1", name: "TypeScript", category: "Programming", level: "expert" },
        { id: "s-2", name: "React", category: "Frontend", level: "expert" },
        { id: "s-3", name: "Node.js", category: "Backend", level: "advanced" },
        { id: "s-4", name: "PostgreSQL", category: "Database", level: "advanced" },
        { id: "s-5", name: "AWS", category: "Cloud", level: "advanced" },
        { id: "s-6", name: "Docker", category: "DevOps", level: "intermediate" },
      ],
      projects: [
        {
          id: "proj-1",
          name: "Open Source CLI Tool",
          description: "A developer productivity tool with 2k+ GitHub stars",
          technologies: ["TypeScript", "Node.js"],
          url: "https://example.com",
        },
      ],
      languages: [
        { id: "lang-1", name: "English", level: "native" },
        { id: "lang-2", name: "Spanish", level: "conversational" },
      ],
      certifications: [
        {
          id: "cert-1",
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023-06",
          type: "certification",
        },
      ],
    }),
  },
  {
    id: "test-resume-minimal",
    name: "Minimal Resume",
    templateId: "classic",
    builder: () => ({
      schemaVersion: 2,
      personalInfo: {
        firstName: "Alex",
        lastName: "Taylor",
        email: "alex@example.com",
        phone: "555-555-5555",
        location: "Denver, CO",
        summary: "",
      },
      workExperience: [
        {
          id: "exp-1",
          company: "Acme Corp",
          position: "Software Engineer",
          location: "Remote",
          startDate: "2020-01",
          endDate: "2023-01",
          current: false,
          description: [
            "Led development of microservices architecture serving 1M+ requests daily",
          ],
        },
      ],
      education: [],
      skills: [],
    }),
  },
  {
    id: "test-resume-empty",
    name: "Empty Resume",
    templateId: "executive",
    builder: () => ({
      schemaVersion: 2,
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
    }),
  },
];

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  // Seed resumes
  const resumeIds: string[] = [];
  for (const resume of RESUMES_TO_SEED) {
    const ref = db
      .collection("users")
      .doc(user.uid)
      .collection("savedResumes")
      .doc(resume.id);

    batch.set(ref, {
      userId: user.uid,
      name: resume.name,
      templateId: resume.templateId,
      data: resume.builder(),
      createdAt: now,
      updatedAt: now,
    });

    resumeIds.push(resume.id);
  }

  // Seed cover letter
  const coverLetterId = "test-cover-letter-1";
  const coverLetterRef = db
    .collection("users")
    .doc(user.uid)
    .collection("savedCoverLetters")
    .doc(coverLetterId);

  batch.set(coverLetterRef, {
    userId: user.uid,
    name: "Software Engineer Cover Letter",
    jobTitle: "Senior Software Engineer",
    companyName: "TechCorp Inc.",
    data: createSampleCoverLetter(),
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();

  return NextResponse.json({
    success: true,
    userId: user.uid,
    resumeIds,
    coverLetterId,
  });
}

function createSampleCoverLetter() {
  const now = new Date().toISOString();
  return {
    id: "test-cl-1",
    jobTitle: "Senior Software Engineer",
    jobReference: "JOB-2026-001",
    date: now.split("T")[0],
    recipient: {
      name: "Jane Smith",
      title: "Engineering Manager",
      company: "TechCorp Inc.",
      department: "Engineering",
    },
    senderName: "Sarah Mitchell",
    senderEmail: "sarah@example.com",
    senderPhone: "(555) 123-4567",
    senderLocation: "San Francisco, CA",
    senderLinkedin: "linkedin.com/in/sarahmitchell",
    senderWebsite: "sarahmitchell.dev",
    salutation: "Dear Jane Smith,",
    openingParagraph:
      "I am writing to express my interest in the Senior Software Engineer position at TechCorp Inc. With over 8 years of experience building scalable web applications, I am confident I can make a significant contribution to your engineering team.",
    bodyParagraphs: [
      "In my current role at TechFlow Inc., I led the redesign of our core platform, resulting in a 40% increase in user engagement. I also established CI/CD pipelines that reduced deployment time from 2 hours to 15 minutes, significantly improving our team's velocity.",
      "I am particularly drawn to TechCorp's mission of democratizing technology access. My experience with microservices architecture, real-time systems, and team leadership aligns well with the challenges your team is tackling.",
    ],
    closingParagraph:
      "I would welcome the opportunity to discuss how my experience and skills can benefit TechCorp. I am available for an interview at your convenience and look forward to hearing from you.",
    signOff: "Sincerely,",
    templateId: "modern" as const,
    tone: "professional" as const,
    createdAt: now,
    updatedAt: now,
  };
}
