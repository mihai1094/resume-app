import { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Dashboard - ResumeForge",
  description: "Manage your resumes and cover letters.",
};

type DashboardPageProps = {
  searchParams: {
    tab?: string;
  };
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : undefined;

  return (
    <AuthGuard>
      <DashboardContent initialTab={tab} />
    </AuthGuard>
  );
}
