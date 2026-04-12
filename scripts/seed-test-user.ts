/**
 * Seed Test User Script
 *
 * Creates a test user in Firebase Auth and seeds Firestore with sample data.
 * Usage:
 *   npx tsx scripts/seed-test-user.ts           # Create/reset test user + seed data
 *   npx tsx scripts/seed-test-user.ts --cleanup  # Remove test user and all data
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local before anything else
config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Config ──

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "test@resumebuilder.dev";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "TestUser123!";
const TEST_DISPLAY_NAME = "Test User";

// ── Firebase Admin init ──

function initAdmin() {
  if (getApps().length > 0) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add it to .env.local and source it."
    );
    process.exit(1);
  }

  const credentials = JSON.parse(serviceAccountJson);
  initializeApp({
    credential: cert(credentials),
    projectId: credentials.project_id,
  });
}

// ── Resume data builders (inline to avoid TS path alias issues in scripts) ──

function createCompleteResume() {
  return {
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
      { id: "s-1", name: "TypeScript", category: "Programming Languages", level: "expert" },
      { id: "s-2", name: "JavaScript", category: "Programming Languages", level: "expert" },
      { id: "s-3", name: "React", category: "Frameworks & Libraries", level: "expert" },
      { id: "s-4", name: "Node.js", category: "Frameworks & Libraries", level: "advanced" },
      { id: "s-5", name: "PostgreSQL", category: "Databases", level: "advanced" },
      { id: "s-6", name: "AWS", category: "Cloud & DevOps", level: "advanced" },
      { id: "s-7", name: "Docker", category: "Cloud & DevOps", level: "intermediate" },
      { id: "s-8", name: "Team Leadership", category: "Soft Skills", level: "expert" },
      { id: "s-9", name: "Mentoring", category: "Soft Skills", level: "expert" },
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
  };
}

function createMinimalResume() {
  return {
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
  };
}

function createEmptyResume() {
  return {
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
  };
}

// ── Main ──

async function main() {
  const isCleanup = process.argv.includes("--cleanup");

  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  if (isCleanup) {
    console.log("Cleaning up test user...");
    await cleanup(auth, db);
    console.log("Done.");
    return;
  }

  console.log(`Setting up test user: ${TEST_EMAIL}`);

  // 1. Create or reset Firebase Auth user
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(TEST_EMAIL);
    console.log(`  User exists (${existing.uid}), deleting and recreating...`);
    await deleteUserData(db, existing.uid);
    await auth.deleteUser(existing.uid);
  } catch {
    // User doesn't exist, that's fine
  }

  const userRecord = await auth.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    displayName: TEST_DISPLAY_NAME,
    emailVerified: true,
  });
  uid = userRecord.uid;
  console.log(`  Created user: ${uid}`);

  // 2. Create user metadata
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);

  await db
    .collection("users")
    .doc(uid)
    .set({
      email: TEST_EMAIL,
      displayName: TEST_DISPLAY_NAME,
      plan: "premium",
      subscription: { plan: "premium", status: "active" },
      usage: {
        aiCreditsUsed: 0,
        aiCreditsResetDate: nextMonth.toISOString(),
        lastCreditReset: new Date().toISOString(),
      },
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });
  console.log("  Created user metadata (premium plan)");

  // 3. Seed resumes
  const now = FieldValue.serverTimestamp();
  const resumes = [
    { id: "test-resume-complete", name: "Full Stack Developer Resume", templateId: "modern", data: createCompleteResume() },
    { id: "test-resume-minimal", name: "Minimal Resume", templateId: "classic", data: createMinimalResume() },
    { id: "test-resume-empty", name: "Empty Resume", templateId: "executive", data: createEmptyResume() },
  ];

  for (const r of resumes) {
    await db
      .collection("users")
      .doc(uid)
      .collection("savedResumes")
      .doc(r.id)
      .set({
        userId: uid,
        name: r.name,
        templateId: r.templateId,
        data: r.data,
        createdAt: now,
        updatedAt: now,
      });
    console.log(`  Created resume: ${r.id} (${r.templateId})`);
  }

  console.log("\nTest account ready!");
  console.log(`  Email:    ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  UID:      ${uid}`);
  console.log(`  Plan:     premium`);
  console.log(`  Resumes:  ${resumes.length}`);
}

async function cleanup(auth: ReturnType<typeof getAuth>, db: ReturnType<typeof getFirestore>) {
  try {
    const user = await auth.getUserByEmail(TEST_EMAIL);
    await deleteUserData(db, user.uid);
    await auth.deleteUser(user.uid);
    console.log(`  Deleted user ${user.uid} and all data`);
  } catch {
    console.log("  Test user not found, nothing to clean up");
  }
}

async function deleteUserData(db: ReturnType<typeof getFirestore>, uid: string) {
  const collections = ["savedResumes", "savedCoverLetters", "resumes"];

  for (const col of collections) {
    const docs = await db.collection("users").doc(uid).collection(col).listDocuments();
    for (const doc of docs) {
      await doc.delete();
    }
  }

  await db.collection("users").doc(uid).delete();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
