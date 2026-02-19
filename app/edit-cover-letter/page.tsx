import { Suspense } from "react";
import { Metadata } from "next";
import { CoverLetterEditor } from "@/components/cover-letter/cover-letter-editor";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Edit Cover Letter - ResumeForge",
  description: "Edit your cover letter with our powerful editor.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditCoverLetterPage() {
  return (
    <Suspense>
      <AuthGuard>
        <CoverLetterEditor />
      </AuthGuard>
    </Suspense>
  );
}
