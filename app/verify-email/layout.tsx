import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Verify Your Email | ResumeZeus",
  description: "Please verify your email address to continue.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/verify-email"),
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
