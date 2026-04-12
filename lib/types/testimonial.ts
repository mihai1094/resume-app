export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface TestimonialSubmissionInput {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  consentToPublish: boolean;
}

export interface TestimonialRecord extends TestimonialSubmissionInput {
  id: string;
  userId: string;
  userEmail: string | null;
  status: TestimonialStatus;
  source: "dashboard";
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}
