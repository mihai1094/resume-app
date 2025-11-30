import { Metadata } from "next";
import { CoverLetterEditor } from "@/components/cover-letter/cover-letter-editor";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Edit Cover Letter - ResumeForge",
  description: "Edit your cover letter with our powerful editor.",
};

export default function EditCoverLetterPage() {
  return (
    <AuthGuard>
      <CoverLetterEditor />
    </AuthGuard>
  );
}
