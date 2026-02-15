import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplicationsContent } from "./applications-content";
import { AuthGuard } from "@/components/auth/auth-guard";
import { launchFlags } from "@/config/launch";

export const metadata: Metadata = {
  title: "Job Applications - ResumeForge",
  description: "Track your job applications with a visual Kanban board.",
};

export default function ApplicationsPage() {
  if (!launchFlags.features.jobTracker) {
    redirect("/dashboard");
  }

  return (
    <Suspense>
      <AuthGuard>
        <ApplicationsContent />
      </AuthGuard>
    </Suspense>
  );
}
