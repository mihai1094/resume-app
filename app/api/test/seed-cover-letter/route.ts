import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { testRouteGuard } from "../guard";

export async function POST(request: NextRequest) {
  const guard = await testRouteGuard(request);
  if (!guard.success) return guard.response;

  const { user } = guard;
  const db = getAdminDb();
  const now = FieldValue.serverTimestamp();

  const id = `test-cl-${Date.now()}`;
  const ref = db
    .collection("users")
    .doc(user.uid)
    .collection("savedCoverLetters")
    .doc(id);

  const isoNow = new Date().toISOString();

  await ref.set({
    userId: user.uid,
    name: "Test Cover Letter",
    jobTitle: "Frontend Developer",
    companyName: "StartupXYZ",
    data: {
      id,
      jobTitle: "Frontend Developer",
      date: isoNow.split("T")[0],
      recipient: {
        name: "John Doe",
        title: "CTO",
        company: "StartupXYZ",
      },
      senderName: "Test User",
      senderEmail: process.env.TEST_USER_EMAIL ?? "",
      senderPhone: "(555) 000-0000",
      senderLocation: "Remote",
      salutation: "Dear John Doe,",
      openingParagraph:
        "I am excited to apply for the Frontend Developer position at StartupXYZ.",
      bodyParagraphs: [
        "With strong expertise in React, TypeScript, and modern web development, I can help build exceptional user experiences for your product.",
      ],
      closingParagraph:
        "I look forward to discussing how I can contribute to your team.",
      signOff: "Best regards,",
      templateId: "classic",
      tone: "enthusiastic",
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ success: true, coverLetterId: id });
}
