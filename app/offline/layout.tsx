import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Offline | ResumeZeus",
  description: "Offline status page for ResumeZeus.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/offline"),
  },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
