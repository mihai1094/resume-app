import { Suspense } from "react";
import { Metadata } from "next";
import { ApplicationsContent } from "./applications-content";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Job Applications - ResumeForge",
  description: "Track your job applications with a visual Kanban board.",
};

export default function ApplicationsPage() {
  return (
    <Suspense>
      <AuthGuard>
        <ApplicationsContent />
      </AuthGuard>
    </Suspense>
  );
}
