import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type {
  PublicTestimonial,
  TestimonialRecord,
  TestimonialStatus,
  TestimonialSubmissionInput,
} from "@/lib/types/testimonial";
import type { AdminDashboardData, AdminFeedbackItem } from "@/lib/types/admin";

const TESTIMONIALS_COLLECTION = "testimonials";
const FEEDBACK_COLLECTION = "feedback";

function toTestimonialRecord(
  id: string,
  data: Partial<TestimonialRecord>
): TestimonialRecord {
  return {
    id,
    name: data.name ?? "",
    role: data.role ?? "",
    company: data.company ?? "",
    content: data.content ?? "",
    rating: typeof data.rating === "number" ? data.rating : 5,
    consentToPublish: data.consentToPublish ?? false,
    userId: data.userId ?? "",
    userEmail: data.userEmail ?? null,
    status: data.status ?? "pending",
    source: "dashboard",
    createdAt: data.createdAt ?? new Date().toISOString(),
    approvedAt: data.approvedAt ?? null,
    approvedBy: data.approvedBy ?? null,
    rejectedAt: data.rejectedAt ?? null,
    rejectedBy: data.rejectedBy ?? null,
  };
}

function toFeedbackItem(
  id: string,
  data: Partial<AdminFeedbackItem>
): AdminFeedbackItem {
  return {
    id,
    userId: data.userId ?? "",
    userEmail: data.userEmail ?? null,
    category:
      data.category === "bug" ||
      data.category === "feature" ||
      data.category === "general"
        ? data.category
        : "general",
    message: data.message ?? "",
    status: data.status ?? "new",
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

export async function submitTestimonial(
  input: TestimonialSubmissionInput,
  user: { uid: string; email?: string | null }
) {
  const db = getAdminDb();
  const ref = db.collection(TESTIMONIALS_COLLECTION).doc();
  const now = new Date().toISOString();

  const payload: TestimonialRecord = {
    id: ref.id,
    userId: user.uid,
    userEmail: user.email ?? null,
    status: "pending",
    source: "dashboard",
    createdAt: now,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    ...input,
  };

  await ref.set(payload);

  return payload;
}

export async function getAllTestimonials(limit = 100) {
  const db = getAdminDb();
  const snapshot = await db.collection(TESTIMONIALS_COLLECTION).limit(limit).get();

  return snapshot.docs
    .map((doc) =>
      toTestimonialRecord(doc.id, doc.data() as Partial<TestimonialRecord>)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApprovedTestimonials(limit = 6) {
  const allTestimonials = await getAllTestimonials(100);

  return allTestimonials
    .filter(
      (testimonial) =>
        testimonial.status === "approved" && testimonial.consentToPublish
    )
    .sort((a, b) =>
      (b.approvedAt ?? b.createdAt).localeCompare(a.approvedAt ?? a.createdAt)
    )
    .slice(0, limit)
    .map<PublicTestimonial>((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating,
    }));
}

export async function updateTestimonialStatus(
  testimonialId: string,
  status: TestimonialStatus,
  adminEmail: string
) {
  const db = getAdminDb();
  const ref = db.collection(TESTIMONIALS_COLLECTION).doc(testimonialId);
  const now = new Date().toISOString();

  await ref.set(
    {
      status,
      approvedAt: status === "approved" ? now : null,
      approvedBy: status === "approved" ? adminEmail : null,
      rejectedAt: status === "rejected" ? now : null,
      rejectedBy: status === "rejected" ? adminEmail : null,
    },
    { merge: true }
  );
}

async function getFeedback(limit = 25) {
  const db = getAdminDb();
  const snapshot = await db.collection(FEEDBACK_COLLECTION).limit(limit).get();

  return snapshot.docs
    .map((doc) =>
      toFeedbackItem(doc.id, doc.data() as Partial<AdminFeedbackItem>)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [feedback, testimonials] = await Promise.all([
    getFeedback(),
    getAllTestimonials(),
  ]);

  return {
    stats: {
      totalFeedback: feedback.length,
      newFeedback: feedback.filter((item) => item.status === "new").length,
      totalTestimonials: testimonials.length,
      pendingTestimonials: testimonials.filter(
        (item) => item.status === "pending"
      ).length,
      approvedTestimonials: testimonials.filter(
        (item) => item.status === "approved"
      ).length,
    },
    feedback,
    testimonials,
  };
}
