import type { TestimonialRecord } from "./testimonial";

export interface AdminFeedbackItem {
  id: string;
  userId: string;
  userEmail: string | null;
  category: "bug" | "feature" | "general";
  message: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalFeedback: number;
  newFeedback: number;
  totalTestimonials: number;
  pendingTestimonials: number;
  approvedTestimonials: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  feedback: AdminFeedbackItem[];
  testimonials: TestimonialRecord[];
}
