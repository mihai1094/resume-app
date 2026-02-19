import { Suspense } from "react";
import { Metadata } from "next";
import { CoverLetterContent } from "./cover-letter-content";
import { LoadingPage } from "@/components/shared/loading";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Cover Letter Builder | Free Professional Cover Letter Creator",
  description:
    "Create professional cover letters that complement your resume. Easy-to-use editor with real-time preview and PDF export.",
  keywords: [
    "cover letter builder",
    "cover letter creator",
    "professional cover letter",
    "job application letter",
    "free cover letter",
    "cover letter template",
  ],
  openGraph: {
    title: "Cover Letter Builder | Free Professional Cover Letter Creator",
    description:
      "Create professional cover letters that complement your resume. Easy-to-use editor with real-time preview and PDF export.",
    type: "website",
    url: toAbsoluteUrl("/cover-letter"),
  },
  alternates: {
    canonical: toAbsoluteUrl("/cover-letter"),
  },
};

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CoverLetterContent />
    </Suspense>
  );
}












