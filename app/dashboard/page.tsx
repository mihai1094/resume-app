import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Dashboard - ResumeForge",
  description: "Manage your resumes and cover letters.",
};

type DashboardPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : undefined;

  return (
    <Suspense>
      <AuthGuard>
        <DashboardContent initialTab={tab} />
      </AuthGuard>
    </Suspense>
  );
}
