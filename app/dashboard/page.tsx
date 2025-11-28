import { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard - ResumeForge",
  description: "Manage your resumes and cover letters.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
