import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplicationsContent } from "./applications-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import { launchFlags } from "@/config/launch";
import { LoadingPage } from "@/components/shared/loading";

export const metadata: Metadata = {
  title: "Job Applications",
  description: "Track your job applications with a visual Kanban board.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationsPage() {
  if (!launchFlags.features.jobTracker) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<LoadingPage text="Loading applications..." />}>
      <AuthGuard>
        <ApplicationsContent />
      </AuthGuard>
    </Suspense>
  );
}
