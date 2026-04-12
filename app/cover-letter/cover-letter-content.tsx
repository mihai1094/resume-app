"use client";

import { Suspense } from "react";
import { CoverLetterEditor } from "@/components/cover-letter";
import { AuthGuard } from "@/components/auth/auth-guard";

export function CoverLetterContent() {
  return (
    <AuthGuard>
      <Suspense>
        <CoverLetterEditor />
      </Suspense>
    </AuthGuard>
  );
}













