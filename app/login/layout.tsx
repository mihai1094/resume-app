import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to access your resumes, free PDF exports, and remaining AI credits in ResumeZeus.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/login"),
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
