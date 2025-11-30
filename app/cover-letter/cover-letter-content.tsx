"use client";

import { CoverLetterEditor } from "@/components/cover-letter";
import { AuthGuard } from "@/components/auth/auth-guard";

export function CoverLetterContent() {
  return (
    <AuthGuard>
      <CoverLetterEditor />
    </AuthGuard>
  );
}







