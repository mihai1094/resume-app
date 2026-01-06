import { Timestamp } from "firebase/firestore";

/**
 * Status stages for job applications in the Kanban board.
 * Represents the typical job application pipeline.
 */
export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "rejected";

/**
 * Contact information for people at the company
 */
export interface ApplicationContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

/**
 * Interview event for an application
 */
export interface ApplicationInterview {
  id: string;
  date: string; // ISO string for client-side, converted to Timestamp for Firestore
  type: "phone" | "video" | "onsite" | "technical" | "behavioral";
  notes?: string;
  completed: boolean;
  interviewer?: string;
}

/**
 * Core job application data
 */
export interface JobApplication {
  id: string;
  userId: string;
  resumeId?: string; // Which resume was used
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  contacts?: ApplicationContact[];
  interviews?: ApplicationInterview[];
  priority?: "low" | "medium" | "high";
}

/**
 * Firestore representation with Timestamps
 */
export interface JobApplicationFirestore {
  id: string;
  userId: string;
  resumeId?: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  contacts?: ApplicationContact[];
  interviews?: ApplicationInterview[];
  priority?: "low" | "medium" | "high";
}

/**
 * Column configuration for Kanban board
 */
export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  color: string;
  description: string;
}

/**
 * Predefined Kanban columns configuration
 */
export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "wishlist",
    title: "Wishlist",
    color: "bg-slate-500",
    description: "Jobs you want to apply to",
  },
  {
    id: "applied",
    title: "Applied",
    color: "bg-blue-500",
    description: "Applications submitted",
  },
  {
    id: "screening",
    title: "Screening",
    color: "bg-yellow-500",
    description: "Initial review stage",
  },
  {
    id: "interviewing",
    title: "Interviewing",
    color: "bg-purple-500",
    description: "Active interview process",
  },
  {
    id: "offer",
    title: "Offer",
    color: "bg-green-500",
    description: "Received an offer",
  },
  {
    id: "rejected",
    title: "Rejected",
    color: "bg-red-500",
    description: "Application declined",
  },
];

/**
 * Statistics for applications dashboard
 */
export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  responseRate: number; // Percentage of applications that got past "applied"
  interviewRate: number; // Percentage that reached "interviewing" or beyond
  offerRate: number; // Percentage that received offers
  activeApplications: number; // Not rejected or in offer stage
}

/**
 * Input for creating a new application
 */
export type CreateApplicationInput = Omit<
  JobApplication,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

/**
 * Input for updating an application
 */
export type UpdateApplicationInput = Partial<
  Omit<JobApplication, "id" | "userId" | "createdAt">
>;

/**
 * Helper to get column by status
 */
export function getColumnByStatus(status: ApplicationStatus): KanbanColumn {
  return KANBAN_COLUMNS.find((col) => col.id === status) || KANBAN_COLUMNS[0];
}

/**
 * Helper to check if status indicates "responded"
 */
export function hasResponded(status: ApplicationStatus): boolean {
  return !["wishlist", "applied"].includes(status);
}

/**
 * Helper to check if application is still active
 */
export function isActiveApplication(status: ApplicationStatus): boolean {
  return !["offer", "rejected"].includes(status);
}

/**
 * Interview type labels
 */
export const INTERVIEW_TYPE_LABELS: Record<ApplicationInterview["type"], string> = {
  phone: "Phone Screen",
  video: "Video Call",
  onsite: "On-site",
  technical: "Technical",
  behavioral: "Behavioral",
};
