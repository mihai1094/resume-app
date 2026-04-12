import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a free ResumeZeus account to build resumes, export PDFs, and get 30 AI credits at signup.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/register"),
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
