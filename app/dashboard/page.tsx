import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardSkeleton } from "@/components/loading-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your resumes and cover letters.",
  robots: {
    index: false,
    follow: false,
  },
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
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthGuard>
        <DashboardContent initialTab={tab} />
      </AuthGuard>
    </Suspense>
  );
}
